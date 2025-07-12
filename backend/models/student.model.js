import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: 'School',
        required: true
    },
    student_class: {
        type: mongoose.Schema.ObjectId,
        ref: 'Class',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    guardian: {
        type: String,
        required: true,
        trim: true
    },
    guardian_phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    student_image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
})

export default mongoose.model('Student', studentSchema);