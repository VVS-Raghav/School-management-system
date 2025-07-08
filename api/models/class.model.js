import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    school:{
        type: mongoose.Schema.ObjectId,
        ref: 'School',
        required: true
    },
    class_text : {
        type: String,
        required: true,
        trim: true
    },
    class_num : {
        type: String,
        required: true,
    },
    attendee : {
        type: mongoose.Schema.ObjectId,
        ref: 'Teacher',
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
})

export default mongoose.model('Class', classSchema);