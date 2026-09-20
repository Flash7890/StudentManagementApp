const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const aiService = require('../services/ai.service');
const notificationService = require('../services/notification.service');
const Student = require('../models/Student');
const User = require('../models/User');

// Lets the frontend hide the AI buttons when no API key is set on the server.
const getStatus = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { enabled: aiService.isConfigured(), model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile' }, 'AI status')
  );
});

const ask = asyncHandler(async (req, res) => {
  const { question, history } = req.body;

  // students get their own record attached so answers are personal but still scoped
  let studentId = null;
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id }).select('_id');
    if (!student) throw new ApiError(404, 'Student profile not found');
    studentId = student._id;
  }

  const result = await aiService.askAssistant({
    question,
    role: req.user.role,
    studentId,
    history,
  });

  res.status(200).json(new ApiResponse(200, result, 'Answer generated'));
});

const summarizeStudent = asyncHandler(async (req, res) => {
  const result = await aiService.summarizeStudentPerformance(req.params.studentId);
  res.status(200).json(new ApiResponse(200, result, 'Summary generated'));
});

const summarizeMe = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id }).select('_id');
  if (!student) throw new ApiError(404, 'Student profile not found');

  const result = await aiService.summarizeStudentPerformance(student._id);
  res.status(200).json(new ApiResponse(200, result, 'Summary generated'));
});

const draftAnnouncement = asyncHandler(async (req, res) => {
  const draft = await aiService.draftAnnouncement(req.body);
  res.status(200).json(new ApiResponse(200, draft, 'Draft generated'));
});

// Admin reviewed the draft and pressed send, so publish it as a real announcement.
const sendDraftedAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, roles } = req.body;
  if (!title || !message) throw new ApiError(400, 'Title and message are required');

  // same recipient logic as the normal announcement endpoint
  const query = roles && roles.length ? { role: { $in: roles } } : {};
  const users = await User.find(query).select('_id');
  const recipientIds = users.map((u) => u._id);

  await notificationService.createAnnouncement(title, message, recipientIds, req.user._id);

  res.status(201).json(new ApiResponse(201, { recipients: recipientIds.length }, 'Announcement sent'));
});

const draftCourseDescription = asyncHandler(async (req, res) => {
  const result = await aiService.draftCourseDescription(req.params.courseId);
  res.status(200).json(new ApiResponse(200, result, 'Description generated'));
});

module.exports = {
  getStatus,
  ask,
  summarizeStudent,
  summarizeMe,
  draftAnnouncement,
  sendDraftedAnnouncement,
  draftCourseDescription,
};
