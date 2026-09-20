const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const enrollmentService = require('../services/enrollment.service');
const Student = require('../models/Student');

const enrollStudent = asyncHandler(async (req, res) => {
  let { studentId, courseId } = req.body;
  if (req.user.role === 'student') {
    const profile = await Student.findOne({ userId: req.user._id });
    if (!profile) throw new (require('../utils/ApiError'))(404, 'Student profile not found');
    studentId = profile._id;
  }
  if (!studentId) throw new (require('../utils/ApiError'))(400, 'studentId is required');
  if (!courseId) throw new (require('../utils/ApiError'))(400, 'courseId is required');
  const enrollment = await enrollmentService.enrollStudent(studentId, courseId, req.user._id);
  res.status(201).json(new ApiResponse(201, enrollment, 'Enrolled successfully'));
});

const dropEnrollment = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const enrollment = await enrollmentService.dropEnrollment(req.params.id, student._id);
  res.status(200).json(new ApiResponse(200, enrollment, 'Enrollment dropped'));
});

const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.updateEnrollmentStatus(req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, enrollment, 'Status updated'));
});

const getMyEnrollments = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const enrollments = await enrollmentService.getStudentEnrollments(student._id);
  res.status(200).json(new ApiResponse(200, enrollments, 'Enrollments fetched'));
});

const getStudentEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getStudentEnrollments(req.params.studentId);
  res.status(200).json(new ApiResponse(200, enrollments, 'Enrollments fetched'));
});

const getCourseEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getCourseEnrollments(req.params.courseId);
  res.status(200).json(new ApiResponse(200, enrollments, 'Enrollments fetched'));
});

module.exports = {
  enrollStudent, dropEnrollment, updateEnrollmentStatus,
  getMyEnrollments, getStudentEnrollments, getCourseEnrollments,
};