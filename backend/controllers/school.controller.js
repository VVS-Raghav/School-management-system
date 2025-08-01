import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import formidable from "formidable";
import School from "../models/school.model.js";
import cloudinary from "../utils/cloudinary.js"; 
import nodemailer from "nodemailer";
import { generateOTP, verifyOTP } from "../utils/otp.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  const existing = await School.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const otp = generateOTP(email);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"SmartSkool Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "OTP for School Registration",
    html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes only.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("OTP email error", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const validateOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }
  if (!verifyOTP(email, otp.toString())) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }
  return res.status(200).json({ success: true, message: "OTP verified successfully" });
}

export const registerSchool = async (req, res) => {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ success: false, message: "Form parsing failed" });
    }

    const photo = Array.isArray(files.image) ? files.image[0] : files.image;
    const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
    const school_name = Array.isArray(fields.school_name) ? fields.school_name[0] : fields.school_name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const owner_name = Array.isArray(fields.owner_name) ? fields.owner_name[0] : fields.owner_name;

    if (!email || !password || !school_name || !owner_name) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const schoolexists = await School.findOne({ email });
    if (schoolexists) {
      return res.status(409).json({ success: false, message: "School with this email already exists" });
    }

    if (!photo || !photo.filepath) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    let uploadedImageUrl = "";
    try {
      const uploadResult = await cloudinary.uploader.upload(photo.filepath, {
        folder: "school_images",
        public_id: `${school_name}_${Date.now()}`,
      });
      uploadedImageUrl = uploadResult.secure_url;
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      return res.status(500).json({ success: false, message: "Image upload failed" });
    }

    try {
      const hashedPassword = bcrypt.hashSync(password, 10);

      const newSchool = new School({
        school_name,
        email,
        owner_name,
        password: hashedPassword,
        school_image: uploadedImageUrl,
      });

      const savedSchool = await newSchool.save();
      return res.status(201).json({
        success: true,
        message: "School registered successfully",
        school: savedSchool,
      });
    } catch (e) {
      console.error("Database save error:", e);
      return res.status(500).json({ success: false, message: "Failed to save school" });
    }
  });
};

export const loginSchool = async (req, res) => {
  try {
    const { email, password } = req.body;
    const school = await School.findOne({ email });
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const isPasswordValid = bcrypt.compareSync(password, school.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: school._id,
        schoolId: school._id,
        school_name: school.school_name,
        owner_name: school.owner_name,
        image_url: school.school_image,
        role: "SCHOOL"
      },
      process.env.JWT_SECRET,
    );

    res.header("Authorization", token);

    res.status(200).json({
      success: true, message: "Login successful",
      user: {
        id: school._id,
        school_name: school.school_name,
        owner_name: school.owner_name,
        image_url: school.school_image,
        role: "SCHOOL"
      }
    });
  } catch (error) {
    console.error("Error logging in school:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().select(['-password', '-email', '-createdAt', '-__id', '-owner_name']);
    res.status(200).json({ success: true, message: "Successfully fetched all schools data", schools: schools });
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const getSchoolOwnData = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const school = await School.findById(schoolId).select(['-password']);
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    res.status(200).json({ success: true, message: "Successfully fetched school data", school: school });
  } catch (error) {
    console.error("Error fetching school data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

      Object.entries(fields).forEach(([key, value]) => {
        school[key] = Array.isArray(value) ? value[0] : value;
      });

      const photo = Array.isArray(files.image) ? files.image[0] : files.image;

      if (photo && photo.filepath) {
        try {
          const uploadResult = await cloudinary.uploader.upload(photo.filepath, {
            folder: "school_images",
            public_id: `school_${school._id}_${Date.now()}`,
            overwrite: true,
          });
          school.school_image = uploadResult.secure_url;
        } catch (uploadErr) {
          console.error("Cloudinary upload error:", uploadErr);
          return res.status(500).json({ success: false, message: "Image upload failed" });
        }
      }

      await school.save();

      return res.status(200).json({
        success: true,
        message: "School updated successfully",
        school,
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};