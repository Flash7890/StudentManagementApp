const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

const getAdminDashboard = async () => {
  const [
    totalStudents, totalFaculty, totalCourses, totalUsers,
    activeEnrollments, droppedEnrollments,
    enrollmentByDept, studentsByStatus,
  ] = await Promise.all([
    Student.countDocuments(),
    Faculty.countDocuments(),
    Course.countDocuments({ status: 'active' }),
    User.countDocuments(),
    Enrollment.countDocuments({ status: 'active' }),
    Enrollment.countDocuments({ status: 'dropped' }),
    Enrollment.aggregate([
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseData' } },
      { $unwind: '$courseData' },
      { $group: { _id: '$courseData.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Student.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    overview: { totalStudents, totalFaculty, totalCourses, totalUsers },
    enrollments: { active: activeEnrollments, dropped: droppedEnrollments },
    enrollmentByDept,
    studentsByStatus,
  };
};

const getFacultyDashboard = async (facultyId) => {
  const Faculty = require('../models/Faculty');
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) return {};

  const courseIds = faculty.assignedCourses;

  const [courses, studentCount, recentAttendance] = await Promise.all([
    Course.find({ _id: { $in: courseIds } }),
    Enrollment.countDocuments({ course: { $in: courseIds }, status: 'active' }),
    Attendance.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  return { courses, studentCount, recentAttendance, totalCourses: courses.length };
};

const getStudentDashboard = async (studentId) => {
  const [student, enrollments, grades] = await Promise.all([
    Student.findById(studentId).populate('userId', 'name email avatar'),
    Enrollment.find({ student: studentId, status: 'active' }).populate('course', 'title code credits'),
    Grade.find({ student: studentId, isPublished: true }).populate('course', 'title code credits'),
  ]);

  if (!student) return {};

  // Attendance summary
  const attendanceSummary = await Attendance.aggregate([
    { $match: { student: student._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const { calculateGPA } = require('../utils/gpaCalculator');
  const gpa = calculateGPA(
    grades.map((g) => ({ grade: g.grade, credits: g.course.credits }))
  );

  return {
    student,
    enrolledCourses: enrollments.length,
    enrollments,
    gpa,
    grades,
    attendanceSummary,
  };
};

module.exports = { getAdminDashboard, getFacultyDashboard, getStudentDashboard };