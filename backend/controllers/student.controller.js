import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import formidable from "formidable";
import cloudinary from "../utils/cloudinary.js"; 
import Student from "../models/student.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// REGISTER STUDENT
export const registerStudent = async (req, res) => {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing failed:", err);
      return res.status(500).json({ success: false, message: "Form parsing failed"});
    }

    try {
      const extract = (key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]);

      const name = extract("name");
      const email = extract("email");
      const password = extract("password");
      const age = Number(extract("age"));
      const gender = extract("gender");
      const guardian = extract("guardian");
      const guardian_phone = extract("guardian_phone");
      const student_class = extract("student_class");
      const school = req.user.schoolId;

      const photo = Array.isArray(files.image) ? files.image[0] : files.image;

      if (!photo || !photo.filepath || !photo.originalFilename) {
        return res.status(400).json({ success: false, message: "Invalid image file" });
      }

      const existing = await Student.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }

      let uploadedImage;
      try {
        uploadedImage = await cloudinary.uploader.upload(photo.filepath, {
          folder: "student_images",
          public_id: `student_${Date.now()}`,
          overwrite: true,
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const student = new Student({
        name,
        email,
        password: hashedPassword,
        age,
        gender,
        guardian,
        guardian_phone,
        student_class,
        school,
        student_image: uploadedImage.secure_url,
      });

      const saved = await student.save();

      res.status(201).json({
        success: true,
        message: "Student registered successfully",
        student: saved,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
};

// LOGIN STUDENT
export const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await Student.findOne({ email }).populate("student_class").populate("school");
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        const valid = bcrypt.compareSync(password, student.password);
        if (!valid) return res.status(401).json({ success: false, message: "Invalid password" });

        const token = jwt.sign({
            id: student._id,
            schoolId: student.school,
            name: student.name,
            email: student.email,
            role: "STUDENT"
        }, process.env.JWT_SECRET);

        res.header("Authorization", token);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: student._id,
                schoolId: student.school,
                name: student.name,
                email: student.email,
                role: "STUDENT",
                image_url: student.student_image
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET ALL STUDENTS OF A SCHOOL AND QUERY
export const getAllStudents = async (req, res) => {
    try {
        let filterQuery = {};
        const schoolId = req.user.schoolId;
        filterQuery['school'] = schoolId;

        if ('search' in req.query) {
            const str = req.query.search;
            const safeStr = str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
            filterQuery['name'] = { $regex: safeStr, $options: "i" };
        }
        if ('student_class' in req.query) {
            filterQuery['student_class'] = req.query.student_class;
        }

        const students = await Student.find(filterQuery).select('-password').populate('student_class', 'class_text class_num');

        res.status(200).json({
            success: true,
            message: "Fetched students",
            students
        });
    } catch (err) {
        console.error("Fetch all error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET LOGGED IN STUDENT
export const getStudentOwnData = async (req, res) => {
    try {
        const id = req.user.id;
        const schoolID = req.user.schoolId;
        const student = await Student.findOne({ _id: id, school: schoolID }).select("-password").populate('student_class','class_text class_num');

        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        res.status(200).json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET STUDENT USING ID
export const getStudentWithId = async (req, res) => {
    try {
        const id = req.params.id;
        const schoolID = req.user.schoolId;
        const student = await Student.findOne({ _id: id, school: schoolID }).select("-password").populate('student_class');;
        if (!student)return res.status(404).json({ success: false, message: "Student not found" });
        res.status(200).json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// UPDATE STUDENT
export const updateStudent = async (req, res) => {
    const form = formidable({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({ success: false, message: "Form parsing failed" });
        }
        try {
            const id = req.params.id;
            const schoolID = req.user.schoolId;

            const student = await Student.findOne({ _id: id, school: schoolID }).select("-password");
            if (!student) {
                return res.status(404).json({ success: false, message: "Student not found" });
            }

            Object.entries(fields).forEach(([key, value]) => {
                student[key] = Array.isArray(value) ? value[0] : value;
            });

            const photo = Array.isArray(files.image) ? files.image[0] : files.image;
            if (photo && photo.filepath) {
                const uploadResult = await cloudinary.uploader.upload(photo.filepath, {
                    folder: "students",
                    public_id: `${student._id}_${Date.now()}`,
                });
                student.student_image = uploadResult.secure_url;
            }

            await student.save();

            res.status(200).json({
                success: true,
                message: "Student updated successfully",
                student,
            });
        } catch (err) {
            console.error("Update error:", err);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    });
};

// DELETE STUDENT
export const deleteStudent = async (req, res) => {
  try {
    const id = req.params.id;
    const schoolId = req.user.schoolId;

    const deletedStudent = await Student.findOneAndDelete({ _id: id, school: schoolId });
    if (!deletedStudent) {
      return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
    }

    const remainingStudents = await Student.find({ school: schoolId });
    res.status(200).json({ 
      success: true, 
      message: 'Student deleted successfully',
      students: remainingStudents 
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
