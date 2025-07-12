import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: 'School',
        required: true
    },
    subject_name: {
        type: String,
        required: true,
        trim: true
    },
    subject_code: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
})

export default mongoose.model('Subject', subjectSchema);