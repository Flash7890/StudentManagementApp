const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

const enrollStudent = async (studentId, courseId, actorUserId) => {
  const [student, course] = await Promise.all([
    Student.findById(studentId).populate('userId', '_id'),
    Course.findById(courseId),
  ]);
  if (!student) throw new ApiError(404, 'Student not found');
  if (!course) throw new ApiError(404, 'Course not found');
  if (course.status !== 'active') throw new ApiError(400, 'Course is not active');

  // Count active enrollments
  const activeCount = await Enrollment.countDocuments({ course: courseId, status: 'active' });
  if (activeCount >= course.maxStudents) {
    throw new ApiError(400, 'Course is at maximum capacity');
  }

  // Duplicate check handled by unique index; catch 11000 error
  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    semester: student.semester,
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });

  // Create notification
  await Notification.create({
    recipient: student.userId._id,
    title: 'Enrollment Confirmed',
    message: `You have been enrolled in ${course.title} (${course.code})`,
    type: 'enrollment',
    link: `/courses/${courseId}`,
  });

  return enrollment;
};

const dropEnrollment = async (enrollmentId, studentId) => {
  const enrollment = await Enrollment.findById(enrollmentId).populate('course', 'title code');
  if (!enrollment) throw new ApiError(404, 'Enrollment not found');
  if (enrollment.student.toString() !== studentId.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  if (enrollment.status === 'dropped') throw new ApiError(400, 'Already dropped');

  enrollment.status = 'dropped';
  await enrollment.save();
  return enrollment;
};

const updateEnrollmentStatus = async (enrollmentId, status) => {
  const enrollment = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    { status },
    { new: true }
  ).populate('course', 'title code');
  if (!enrollment) throw new ApiError(404, 'Enrollment not found');
  return enrollment;
};

const getStudentEnrollments = async (studentId) => {
  return Enrollment.find({ student: studentId })
    .populate('course', 'title code credits department schedule')
    .sort({ createdAt: -1 });
};

const getCourseEnrollments = async (courseId) => {
  return Enrollment.find({ course: courseId, status: 'active' })
    .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } });
};

module.exports = {
  enrollStudent,
  dropEnrollment,
  updateEnrollmentStatus,
  getStudentEnrollments,
  getCourseEnrollments,
};