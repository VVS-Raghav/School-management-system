import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import formidable from "formidable";
import School  from "../models/school.model.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerSchool = async (req, res) => {

  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Form parsing failed" });
    }

    const photo = Array.isArray(files.image) ? files.image[0] : files.image;
    const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
    const school_name = Array.isArray(fields.school_name) ? fields.school_name[0] : fields.school_name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const owner_name = Array.isArray(fields.owner_name) ? fields.owner_name[0] : fields.owner_name;

    const schoolexists = await School.findOne({ email: email });
    if (schoolexists) {
      return res.status(409).json({ success: false, message: "School with this email already exists" });
    }
    if (!photo || !photo.filepath || !photo.originalFilename) {
      console.log("Image parsing failed:", files.image);
      return res.status(400).json({ success: false, message: "Invalid file upload" });
    }


    const originalFilename = photo.originalFilename.replace(" ", "_");
    const newPath = path.join(__dirname, process.env.SCHOOL_IMG_PATH, originalFilename);

    try {
      const photoData = fs.readFileSync(photo.filepath);
      fs.writeFileSync(newPath, photoData);
    } catch (error) {
      console.error("File saving error:", error);
      return res.status(500).json({ success: false, message: "Saving file failed" });
    }


    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    try {
      const newSchool = new School({
        school_name,
        email,
        owner_name,
        password: hashedPassword,
        school_image: originalFilename,
      });

      const savedSchool = await newSchool.save();
      return res.status(201).json({ success: true, message: "School registered successfully", school: savedSchool });
    } catch (e) {
      console.error("DB save error:", e);
      return res.status(500).json({ success: false, message: "Failed to save school" });
    }
  });
};

export const loginSchool = async (req, res) => {
  try {
    const { email, password } = req.body;
    const school = await School.findOne({ email });
    if (!school) {
      return res.status(404).json({success:false, message: "School not found" });
    }

    const isPasswordValid = bcrypt.compareSync(password, school.password);
    if (!isPasswordValid) {
      return res.status(401).json({success:false, message: "Invalid password" });
    }

    const token  = jwt.sign(
      {
        id: school._id,
        schoolId: school._id,
        school_name: school.school_name,
        owner_name: school.owner_name,
        image_url: school.school_image,
        role:"SCHOOL"
      },
      process.env.JWT_SECRET,
    );

    res.header("Authorization", token);

    res.status(200).json({success:true, message: "Login successful",
        user:{
            id: school._id,
            school_name: school.school_name,
            owner_name: school.owner_name,
            image_url: school.school_image,
            role:"SCHOOL"
        }
    });
  } catch (error) {
    console.error("Error logging in school:", error);
    res.status(500).json({success:false, message: "Internal server error" });
  }
}

export const getAllSchools = async (req, res) => {
    try {
        const schools = await School.find().select(['-password', '-email', '-createdAt','-__id','-owner_name']);
        res.status(200).json({success:true,message: "Successfully fetched all schools data", schools: schools});
    } catch (error) {
        console.error("Error fetching schools:", error);
        res.status(500).json({success:false, message: "Internal server error" });
    }
}

export const getSchoolOwnData = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const school = await School.findById(schoolId).select(['-password']);
        if (!school) {
            return res.status(404).json({success:false, message: "School not found" });
        }
        res.status(200).json({success:true, message: "Successfully fetched school data", school: school});
    } catch (error) {
        console.error("Error fetching school data:", error);
        res.status(500).json({success:false, message: "Internal server error" });
    }
}

export const updateSchool = async (req, res) => {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(400).json({ success: false, message: "Form parsing failed" });
    }

    try {
      const id = req.user.id;
      const school = await School.findById(id);

      if (!school) {
        return res.status(404).json({ success: false, message: "School not found" });
      }

      // ✅ Safely extract fields (if wrapped in arrays)
      Object.entries(fields).forEach(([key, value]) => {
        school[key] = Array.isArray(value) ? value[0] : value;
      });

      // ✅ Handle optional image update
      const photo = Array.isArray(files.image) ? files.image[0] : files.image;

      if (photo && photo.filepath && photo.originalFilename) {
        const originalFilename = photo.originalFilename.trim().replace(/\s/g, "_").toLowerCase();
        const filepath = photo.filepath;

        // Delete old image if it exists
        if (school.school_image) {
          const oldImagePath = path.join(__dirname, process.env.SCHOOL_IMG_PATH, school.school_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Save new image to disk
        const newImagePath = path.join(__dirname, process.env.SCHOOL_IMG_PATH, originalFilename);
        const photoData = fs.readFileSync(filepath);
        fs.writeFileSync(newImagePath, photoData);

        // Update DB field
        school.school_image = originalFilename;
      }

      await school.save();
      return res.status(200).json({
        success: true,
        message: "School updated successfully",
        school: school,
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};