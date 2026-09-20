const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    role: { type: String, enum: ['student', 'faculty'], required: true },
    // Common
    department: { type: String, required: true },
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    // Student-specific
    program: { type: String },
    semester: { type: Number, default: 1 },
    batch: { type: String },
    enrollmentYear: { type: Number },
    // Faculty-specific
    designation: { type: String },
    qualification: { type: String },
    experience: { type: Number },
    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    emailVerified: { type: Boolean, default: false },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

pendingRegistrationSchema.index({ status: 1 });
pendingRegistrationSchema.index({ userId: 1 });

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);