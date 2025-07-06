import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: 'School',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    audience: {
        type: String,
        enum: ['All', 'Students', 'Teachers'],
        default: 'All',
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
});

export default mongoose.model('Notice', noticeSchema);