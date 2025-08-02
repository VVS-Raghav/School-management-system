import mongoose from "mongoose";

const FeeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeTemplate', required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentDate: { type: Date },
  stripeSessionId: { type: String },
  receiptUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Fee', FeeSchema);