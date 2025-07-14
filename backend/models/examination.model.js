import mongoose from "mongoose";

const subjectExamSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true
  },
  examDate: {
    type: Date,
    required: true
  }
}, { _id: false });

const examSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
    required: true
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true
  },
  examType: {
    type: String,
    required: true // e.g., "Midterm"
  },
  examSession: {
    type: String,
    required: true // e.g., "July 2025"
  },
  subjects: {
    type: [subjectExamSchema],
    validate: v => Array.isArray(v) && v.length > 0,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Exam', examSchema);