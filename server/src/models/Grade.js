const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
    },
    // Component marks
    internal: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    midterm: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    final: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // Calculated
    total: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
    },
    gradePoints: {
      type: Number,
      min: 0,
      max: 4,
    },
    semester: { type: Number },
    academicYear: { type: String },
    isPublished: {
      type: Boolean,
      default: false,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, course: 1 }, { unique: true });
gradeSchema.index({ student: 1 });
gradeSchema.index({ course: 1 });
gradeSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Grade', gradeSchema);