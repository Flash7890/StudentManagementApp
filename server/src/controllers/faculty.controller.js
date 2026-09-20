const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const facultyService = require('../services/faculty.service');

const getAllFaculty = asyncHandler(async (req, res) => {
  const result = await facultyService.getAllFaculty(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Faculty fetched'));
});

const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await facultyService.getFacultyById(req.params.id);
  res.status(200).json(new ApiResponse(200, faculty, 'Faculty fetched'));
});

const getMyProfile = asyncHandler(async (req, res) => {
  const faculty = await facultyService.getFacultyByUserId(req.user._id);
  res.status(200).json(new ApiResponse(200, faculty, 'Faculty profile fetched'));
});

const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, ...facultyData } = req.body;
  const result = await facultyService.createFaculty({ name, email, password }, facultyData);
  res.status(201).json(new ApiResponse(201, result, 'Faculty created'));
});

const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await facultyService.updateFaculty(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, faculty, 'Faculty updated'));
});

const deleteFaculty = asyncHandler(async (req, res) => {
  await facultyService.deleteFaculty(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Faculty deleted'));
});

const getFacultyStudents = asyncHandler(async (req, res) => {
  const enrollments = await facultyService.getFacultyStudents(req.params.id);
  res.status(200).json(new ApiResponse(200, enrollments, 'Faculty students fetched'));
});

module.exports = {
  getAllFaculty, getFacultyById, getMyProfile,
  createFaculty, updateFaculty, deleteFaculty, getFacultyStudents,
};