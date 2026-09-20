const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    facultyId: {
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
    // Professional Info
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    designation: { type: String }, // e.g., Assistant Professor
    specialization: [String],
    qualification: { type: String },
    experience: { type: Number, default: 0 }, // years
    joinDate: { type: Date },
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
    },
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  { timestamps: true }
);

facultySchema.index({ facultyId: 1 });
facultySchema.index({ department: 1 });

module.exports = mongoose.model('Faculty', facultySchema);