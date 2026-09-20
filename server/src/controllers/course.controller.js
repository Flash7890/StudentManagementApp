const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const courseService = require('../services/course.service');

const getAllCourses = asyncHandler(async (req, res) => {
  const result = await courseService.getAllCourses(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Courses fetched'));
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  res.status(200).json(new ApiResponse(200, course, 'Course fetched'));
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);
  res.status(201).json(new ApiResponse(201, course, 'Course created'));
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, course, 'Course updated'));
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Course deleted'));
});

const assignFaculty = asyncHandler(async (req, res) => {
  const course = await courseService.assignFaculty(req.params.id, req.body.facultyId);
  res.status(200).json(new ApiResponse(200, course, 'Faculty assigned'));
});

const getCourseStudents = asyncHandler(async (req, res) => {
  const students = await courseService.getCourseStudents(req.params.id);
  res.status(200).json(new ApiResponse(200, students, 'Course students fetched'));
});

module.exports = {
  getAllCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, assignFaculty, getCourseStudents,
};