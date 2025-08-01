import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import Assignment from '../models/assignment.model.js';
import Student from '../models/student.model.js';

export const uploadAssignment = async (req, res) => {
  const uploadDir = path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    multiples: false,
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ success: false, message: 'Form parsing failed' });
    }

    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const deadline = Array.isArray(fields.deadline) ? fields.deadline[0] : fields.deadline;
    const classId = Array.isArray(fields.classId) ? fields.classId[0] : fields.classId;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!title || !deadline || !classId || !file) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!fs.existsSync(file.filepath)) {
      return res.status(500).json({ success: false, message: 'File not found after upload' });
    }

    const newAssignment = new Assignment({
      title,
      deadline,
      classId,
      file: path.basename(file.filepath),
    });

    try {
      await newAssignment.save();
      return res.status(200).json({ success: true, message: 'Assignment uploaded successfully' });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  });
};

export const getStudentAssignments = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const assignments = await Assignment.find({
      classId: student.student_class,
      deadline: { $gte: new Date() }
    }).sort({ deadline: 1 });

    res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    console.error('Fetch assignments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
};