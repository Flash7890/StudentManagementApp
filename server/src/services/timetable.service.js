const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');

const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const hasConflict = (existingSlots, day, startTime, endTime, excludeId) => {
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  return existingSlots.some((slot) => {
    if (slot._id.toString() === excludeId?.toString()) return false;
    if (slot.day !== day) return false;
    const s = timeToMinutes(slot.startTime);
    const e = timeToMinutes(slot.endTime);
    return newStart < e && newEnd > s;
  });
};

const createTimetableEntry = async (data) => {
  const { faculty, room, day, startTime, endTime } = data;

  // Check faculty conflict
  if (faculty) {
    const facultySlots = await Timetable.find({ faculty, day });
    if (hasConflict(facultySlots, day, startTime, endTime)) {
      throw new ApiError(409, 'Faculty has a conflicting schedule on this day/time');
    }
  }

  // Check room conflict
  if (room) {
    const roomSlots = await Timetable.find({ room, day });
    if (hasConflict(roomSlots, day, startTime, endTime)) {
      throw new ApiError(409, 'Room is already booked at this time');
    }
  }

  const entry = await Timetable.create(data);
  return entry.populate([
    { path: 'course', select: 'title code' },
    { path: 'faculty', populate: { path: 'userId', select: 'name' } },
  ]);
};

const getTimetable = async ({ department, semester, facultyId, academicYear }) => {
  const query = {};
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (facultyId) query.faculty = facultyId;
  if (academicYear) query.academicYear = academicYear;

  return Timetable.find(query)
    .populate('course', 'title code credits')
    .populate({ path: 'faculty', populate: { path: 'userId', select: 'name' } })
    .sort({ day: 1, startTime: 1 });
};

const getStudentTimetable = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId, status: 'active' }).select('course');
  const courseIds = enrollments.map((e) => e.course);

  return Timetable.find({ course: { $in: courseIds } })
    .populate('course', 'title code credits')
    .populate({ path: 'faculty', populate: { path: 'userId', select: 'name' } })
    .sort({ day: 1, startTime: 1 });
};

const updateTimetableEntry = async (id, updates) => {
  const entry = await Timetable.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  return entry;
};

const deleteTimetableEntry = async (id) => {
  const entry = await Timetable.findByIdAndDelete(id);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  return entry;
};

module.exports = {
  createTimetableEntry,
  getTimetable,
  getStudentTimetable,
  updateTimetableEntry,
  deleteTimetableEntry,
};