const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const studentService = require('../services/student.service');

const getAllStudents = asyncHandler(async (req, res) => {
  const result = await studentService.getAllStudents(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Students fetched'));
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  res.status(200).json(new ApiResponse(200, student, 'Student fetched'));
});

const getMyProfile = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentByUserId(req.user._id);
  res.status(200).json(new ApiResponse(200, student, 'Student profile fetched'));
});

const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, ...studentData } = req.body;
  const result = await studentService.createStudent({ name, email, password }, studentData);
  res.status(201).json(new ApiResponse(201, result, 'Student created'));
});

const updateStudent = asyncHandler(async (req, res) => {
  const avatarBase64 = req.avatarBase64;
  const updates = { ...req.body };
  if (avatarBase64) {
    const student = await studentService.getStudentById(req.params.id);
    const User = require('../models/User');
    await User.findByIdAndUpdate(student.userId._id, { avatar: avatarBase64 });
  }
  const student = await studentService.updateStudent(req.params.id, updates);
  res.status(200).json(new ApiResponse(200, student, 'Student updated'));
});

const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Student deleted'));
});

module.exports = { getAllStudents, getStudentById, getMyProfile, createStudent, updateStudent, deleteStudent };