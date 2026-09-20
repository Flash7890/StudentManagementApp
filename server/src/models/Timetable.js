const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: {
      type: String, // "09:00"
      required: true,
    },
    endTime: {
      type: String, // "10:00"
      required: true,
    },
    room: { type: String },
    department: { type: String },
    semester: { type: Number },
    academicYear: { type: String },
  },
  { timestamps: true }
);

timetableSchema.index({ department: 1, semester: 1 });
timetableSchema.index({ faculty: 1 });
timetableSchema.index({ course: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);