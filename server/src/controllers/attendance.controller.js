const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const attendanceService = require('../services/attendance.service');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const markAttendance = asyncHandler(async (req, res) => {
  const { courseId, date, records } = req.body;
  const attendance = await attendanceService.markAttendance(courseId, date, records, req.user._id);
  res.status(200).json(new ApiResponse(200, attendance, 'Attendance marked'));
});

const getAttendanceByCourse = asyncHandler(async (req, res) => {
  const records = await attendanceService.getAttendanceByCourse(req.params.courseId, req.query.date);
  res.status(200).json(new ApiResponse(200, records, 'Attendance fetched'));
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');
  const records = await attendanceService.getStudentAttendance(student._id, req.query.courseId);
  res.status(200).json(new ApiResponse(200, records, 'Attendance fetched'));
});

const getStudentAttendance = asyncHandler(async (req, res) => {
  const records = await attendanceService.getStudentAttendance(req.params.studentId, req.query.courseId);
  res.status(200).json(new ApiResponse(200, records, 'Attendance fetched'));
});

const getAttendancePercentage = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.params;
  const stats = await attendanceService.getAttendancePercentage(studentId, courseId);
  res.status(200).json(new ApiResponse(200, stats, 'Attendance percentage fetched'));
});

const getMyAttendanceSummary = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');
  const summary = await attendanceService.getStudentAttendanceSummary(student._id);
  res.status(200).json(new ApiResponse(200, summary, 'Attendance summary fetched'));
});

module.exports = {
  markAttendance, getAttendanceByCourse, getMyAttendance,
  getStudentAttendance, getAttendancePercentage, getMyAttendanceSummary,
};