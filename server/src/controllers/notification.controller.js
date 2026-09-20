const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');
const User = require('../models/User');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Notifications fetched'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const n = await notificationService.markAsRead(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, n, 'Marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'All marked as read'));
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, roles } = req.body;
  // Get all user IDs matching roles
  const query = roles ? { role: { $in: roles } } : {};
  const users = await User.find(query).select('_id');
  const recipientIds = users.map((u) => u._id);

  await notificationService.createAnnouncement(title, message, recipientIds, req.user._id);
  res.status(201).json(new ApiResponse(201, null, 'Announcement sent'));
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});

module.exports = {
  getNotifications, markAsRead, markAllAsRead,
  createAnnouncement, deleteNotification,
};