const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 1,
      max: 6,
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
    },
    maxStudents: {
      type: Number,
      default: 60,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    schedule: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
        startTime: String, // "09:00"
        endTime: String,   // "10:00"
        room: String,
      },
    ],
  },
  { timestamps: true }
);

courseSchema.index({ code: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ faculty: 1 });

module.exports = mongoose.model('Course', courseSchema);