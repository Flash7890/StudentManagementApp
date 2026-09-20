const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const gradeService = require('../services/grade.service');
const Student = require('../models/Student');

const assignGrade = asyncHandler(async (req, res) => {
  const { studentId, courseId, ...gradeData } = req.body;
  const grade = await gradeService.assignGrade(studentId, courseId, {
    ...gradeData,
    gradedBy: req.user._id,
  });
  res.status(200).json(new ApiResponse(200, grade, 'Grade assigned'));
});

const publishGrades = asyncHandler(async (req, res) => {
  await gradeService.publishGrades(req.params.courseId, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Grades published'));
});

const getMyGrades = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');
  const grades = await gradeService.getStudentGrades(student._id);
  res.status(200).json(new ApiResponse(200, grades, 'Grades fetched'));
});

const getStudentGrades = asyncHandler(async (req, res) => {
  const grades = await gradeService.getStudentGrades(req.params.studentId);
  res.status(200).json(new ApiResponse(200, grades, 'Grades fetched'));
});

const getMyTranscript = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');
  const transcript = await gradeService.getStudentTranscript(student._id);
  res.status(200).json(new ApiResponse(200, transcript, 'Transcript fetched'));
});

const getCourseGrades = asyncHandler(async (req, res) => {
  const grades = await gradeService.getCourseGrades(req.params.courseId);
  res.status(200).json(new ApiResponse(200, grades, 'Course grades fetched'));
});

module.exports = {
  assignGrade, publishGrades, getMyGrades,
  getStudentGrades, getMyTranscript, getCourseGrades,
};