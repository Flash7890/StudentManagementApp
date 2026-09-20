const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    // Personal Info
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    // Academic Info
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    program: { type: String }, // e.g., B.Tech, MBA
    semester: {
      type: Number,
      min: 1,
      max: 12,
      default: 1,
    },
    batch: { type: String }, // e.g., "2023-2027"
    enrollmentYear: { type: Number },
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'suspended'],
      default: 'active',
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    // Guardian
    guardian: {
      name: String,
      relation: String,
      phone: String,
      email: String,
    },
  },
  { timestamps: true }
);

studentSchema.index({ studentId: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ semester: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);