import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import formidable from "formidable";
import Student from "../models/student.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// REGISTER STUDENT
export const registerStudent = async (req, res) => {
    const form = formidable({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ success: false, message: "Form parsing failed" });

        // Extract fields safely
        const extract = (key) => Array.isArray(fields[key]) ? fields[key][0] : fields[key];

        const name = extract('name');
        const email = extract('email');
        const password = extract('password');
        const age = Number(extract('age'));
        const gender = extract('gender');
        const guardian = extract('guardian');
        const guardian_phone = extract('guardian_phone');
        const student_class = extract('student_class');
        const school = req.user.schoolId; // From token

        const photo = Array.isArray(files.image) ? files.image[0] : files.image;

        // Validation
        if (!photo || !photo.filepath || !photo.originalFilename)
            return res.status(400).json({ success: false, message: "Invalid image file" });

        const existing = await Student.findOne({ email });
        if (existing) return res.status(409).json({ success: false, message: "Email already in use" });

        const filename = photo.originalFilename.replace(/\s/g, "_").toLowerCase();
        const newPath = path.join(__dirname, process.env.STUDENT_IMG_PATH, filename);

        try {
            const photoData = fs.readFileSync(photo.filepath);
            fs.writeFileSync(newPath, photoData);
        } catch (err) {
            return res.status(500).json({ success: false, message: "Saving image failed" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        try {
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
                student_image: filename
            });

            const saved = await student.save();

            res.status(201).json({
                success: true,
                message: "Student registered successfully",
                student: saved
            });
        } catch (err) {
            console.error("Save error:", err);
            res.status(500).json({ success: false, message: "DB save failed" });
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

// GET ALL STUDENTS OF A SCHOOL
export const getAllStudents = async (req, res) => {
    try {
        let filterQuery = {};
        const schoolId = req.user.schoolId;
        filterQuery['school'] = schoolId;

        if (req.query.hasOwnProperty('search')) {
            filterQuery['name'] = { $regex: req.query.search, $option: "i" };
        }
        if (req.query.hasOwnProperty('student_class')) {
            filterQuery['student_class'] = req.query.student_class;
        }

        const students = await Student.find(filterQuery).select('-password');

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
        const schoolID = req.user.schoolID;
        const student = await Student.findOne({ _id: id, school: schoolID }).select("-password");

        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        res.status(200).json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// UPDATE STUDENT
export const updateStudent = async (req, res) => {
    const form = formidable({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ success: false, message: "Form parsing failed" });

        try {
            const id = req.user.id;
            const schoolID = req.user.schoolID;
            const student = await Student.findOne({ _id: id, school: schoolID }).select("-password");
            if (!student) return res.status(404).json({ success: false, message: "Student not found" });

            // Update fields
            Object.entries(fields).forEach(([key, value]) => {
                student[key] = Array.isArray(value) ? value[0] : value;
            });

            // Handle image update
            const photo = Array.isArray(files.image) ? files.image[0] : files.image;
            if (photo && photo.filepath && photo.originalFilename) {
                const filename = photo.originalFilename.trim().replace(/\s/g, "_").toLowerCase();
                const filepath = photo.filepath;

                if (student.student_image) {
                    const oldPath = path.join(__dirname, process.env.STUDENT_IMG_PATH, student.student_image);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }

                const newImagePath = path.join(__dirname, process.env.STUDENT_IMG_PATH, filename);
                const photoData = fs.readFileSync(filepath);
                fs.writeFileSync(newImagePath, photoData);

                student.student_image = filename;
            }

            await student.save();
            res.status(200).json({ success: true, message: "Student updated", student });
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
