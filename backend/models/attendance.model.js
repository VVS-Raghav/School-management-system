import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: 'School',
        required: true
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
        required: true
    },
    class: {
        type: mongoose.Schema.ObjectId,
        ref: 'Class',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        default: 'Present'
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
})

export default mongoose.model('Attendance', attendanceSchema);