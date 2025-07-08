import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import formidable from "formidable";
import Teacher from "../models/teacher.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// REGISTER TEACHER
export const registerTeacher = async (req, res) => {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, message: "Form parsing failed" });

    const extract = (key) => Array.isArray(fields[key]) ? fields[key][0] : fields[key];

    const name = extract("name");
    const email = extract("email");
    const password = extract("password");
    const age = Number(extract("age"));
    const gender = extract("gender");
    const qualification = extract("qualification");
    const school = req.user.schoolId;

    const photo = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!photo || !photo.filepath || !photo.originalFilename)
      return res.status(400).json({ success: false, message: "Invalid image file" });

    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: "Email already in use" });

    const filename = photo.originalFilename.replace(/\s/g, "_").toLowerCase();
    const newPath = path.join(__dirname, process.env.TEACHER_IMG_PATH, filename);

    try {
      const photoData = fs.readFileSync(photo.filepath);
      fs.writeFileSync(newPath, photoData);
    } catch (err) {
      return res.status(500).json({ success: false, message: "Saving image failed" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      const teacher = new Teacher({
        name,
        email,
        password: hashedPassword,
        age,
        gender,
        qualification,
        school,
        teacher_image: filename
      });

      const saved = await teacher.save();

      res.status(201).json({
        success: true,
        message: "Teacher registered successfully",
        teacher: saved
      });
    } catch (err) {
      console.error("Save error:", err);
      res.status(500).json({ success: false, message: "DB save failed" });
    }
  });
};

// LOGIN TEACHER
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email }).populate("school");
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    const valid = bcrypt.compareSync(password, teacher.password);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      {
        id: teacher._id,
        schoolId: teacher.school,
        name: teacher.name,
        email: teacher.email,
        role: "TEACHER"
      },
      process.env.JWT_SECRET
    );

    res.header("Authorization", token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: teacher._id,
        schoolId: teacher.school,
        name: teacher.name,
        email: teacher.email,
        role: "TEACHER",
        image_url: teacher.teacher_image
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET ALL TEACHERS
export const getAllTeachers = async (req, res) => {
  try {
    const filterQuery = { school: req.user.schoolId };

    if ("search" in req.query) {
      const safeStr = req.query.search.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      filterQuery["name"] = { $regex: safeStr, $options: "i" };
    }

    const teachers = await Teacher.find(filterQuery).select("-password");

    res.status(200).json({ success: true, message: "Fetched teachers", teachers });
  } catch (err) {
    console.error("Fetch all error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET LOGGED-IN TEACHER
export const getTeacherOwnData = async (req, res) => {
  try {
    const id = req.user.id;
    const schoolID = req.user.schoolID;
    const teacher = await Teacher.findOne({ _id: id, school: schoolID }).select("-password");

    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    res.status(200).json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET TEACHER BY ID
export const getTeacherWithId = async (req, res) => {
  try {
    const id = req.params.id;
    const schoolID = req.user.schoolID;
    const teacher = await Teacher.findOne({ _id: id, school: schoolID }).select("-password");

    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    res.status(200).json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// UPDATE TEACHER
export const updateTeacher = async (req, res) => {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ success: false, message: "Form parsing failed" });

    try {
      const id = req.params.id;
      const schoolID = req.user.schoolId;

      const teacher = await Teacher.findOne({ _id: id, school: schoolID }).select("-password");
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

      Object.entries(fields).forEach(([key, value]) => {
        teacher[key] = Array.isArray(value) ? value[0] : value;
      });

      const photo = Array.isArray(files.image) ? files.image[0] : files.image;

      if (photo && photo.filepath && photo.originalFilename) {
        const filename = photo.originalFilename.trim().replace(/\s/g, "_").toLowerCase();

        if (teacher.teacher_image) {
          const oldPath = path.join(__dirname, process.env.TEACHER_IMG_PATH, teacher.teacher_image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const newImagePath = path.join(__dirname, process.env.TEACHER_IMG_PATH, filename);
        const photoData = fs.readFileSync(photo.filepath);
        fs.writeFileSync(newImagePath, photoData);

        teacher.teacher_image = filename;
      }

      await teacher.save();
      res.status(200).json({ success: true, message: "Teacher updated successfully", teacher });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};

// DELETE TEACHER
export const deleteTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const schoolId = req.user.schoolId;

    const deletedTeacher = await Teacher.findOneAndDelete({ _id: id, school: schoolId });
    if (!deletedTeacher) {
      return res.status(404).json({ success: false, message: "Teacher not found or unauthorized" });
    }

    const remainingTeachers = await Teacher.find({ school: schoolId });
    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
      teachers: remainingTeachers
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};