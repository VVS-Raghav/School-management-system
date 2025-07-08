import mongoose from "mongoose";

const examinationSchema = new mongoose.Schema({
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
    subject: {
        type: mongoose.Schema.ObjectId,
        ref: 'Subject',
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    examType:{
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
})

export default mongoose.model('Exam', examinationSchema);