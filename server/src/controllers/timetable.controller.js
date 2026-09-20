const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const timetableService = require('../services/timetable.service');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const createEntry = asyncHandler(async (req, res) => {
  const entry = await timetableService.createTimetableEntry(req.body);
  res.status(201).json(new ApiResponse(201, entry, 'Timetable entry created'));
});

const getTimetable = asyncHandler(async (req, res) => {
  const entries = await timetableService.getTimetable(req.query);
  res.status(200).json(new ApiResponse(200, entries, 'Timetable fetched'));
});

const getMyTimetable = asyncHandler(async (req, res) => {
  let entries;
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) throw new ApiError(404, 'Student profile not found');
    entries = await timetableService.getStudentTimetable(student._id);
  } else if (req.user.role === 'faculty') {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (!faculty) throw new ApiError(404, 'Faculty profile not found');
    entries = await timetableService.getTimetable({ facultyId: faculty._id });
  } else {
    entries = await timetableService.getTimetable(req.query);
  }
  res.status(200).json(new ApiResponse(200, entries, 'Timetable fetched'));
});

const updateEntry = asyncHandler(async (req, res) => {
  const entry = await timetableService.updateTimetableEntry(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, entry, 'Entry updated'));
});

const deleteEntry = asyncHandler(async (req, res) => {
  await timetableService.deleteTimetableEntry(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Entry deleted'));
});

module.exports = { createEntry, getTimetable, getMyTimetable, updateEntry, deleteEntry };