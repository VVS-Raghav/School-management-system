import mongoose from 'mongoose';

const subjectMarkSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
  }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  subjectMarks: {
    type: [subjectMarkSchema],
    validate: v => Array.isArray(v) && v.length > 0,
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1,
  }
}, {
  timestamps: true,
});

export default mongoose.model('Result', resultSchema);