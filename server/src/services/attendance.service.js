const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');

const markAttendance = async (courseId, date, records, markedBy) => {
  // records: [{ studentId, status, remarks }]
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const ops = records.map(({ studentId, status, remarks }) => ({
    updateOne: {
      filter: { student: studentId, course: courseId, date: attendanceDate },
      update: { $set: { status, remarks, markedBy } },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);

  return Attendance.find({ course: courseId, date: attendanceDate })
    .populate({ path: 'student', populate: { path: 'userId', select: 'name' } });
};

const getAttendanceByCourse = async (courseId, date) => {
  const query = { course: courseId };
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: d, $lte: end };
  }

  return Attendance.find(query)
    .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
    .sort({ date: -1 });
};

const getStudentAttendance = async (studentId, courseId) => {
  const query = { student: studentId };
  if (courseId) query.course = courseId;

  return Attendance.find(query).populate('course', 'title code').sort({ date: -1 });
};

const getAttendancePercentage = async (studentId, courseId) => {
  const total = await Attendance.countDocuments({ student: studentId, course: courseId });
  const present = await Attendance.countDocuments({
    student: studentId,
    course: courseId,
    status: { $in: ['present', 'late'] },
  });

  const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
  return { total, present, percentage };
};

const getStudentAttendanceSummary = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId, status: 'active' })
    .populate('course', 'title code');

  const summary = await Promise.all(
    enrollments.map(async (e) => {
      const stats = await getAttendancePercentage(studentId, e.course._id);
      return { course: e.course, ...stats };
    })
  );

  return summary;
};

module.exports = {
  markAttendance,
  getAttendanceByCourse,
  getStudentAttendance,
  getAttendancePercentage,
  getStudentAttendanceSummary,
};