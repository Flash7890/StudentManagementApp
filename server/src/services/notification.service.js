const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

const getNotifications = async (userId, { page = 1, limit = 20, isRead }) => {
  const query = { recipient: userId };
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const skip = (page - 1) * limit;
  const [notifications, total, unread] = await Promise.all([
    Notification.find(query)
      .populate('sender', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount: unread,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const markAsRead = async (notificationId, userId) => {
  const n = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  if (!n) throw new ApiError(404, 'Notification not found');
  return n;
};

const markAllAsRead = async (userId) => {
  return Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

const createAnnouncement = async (title, message, recipientIds, senderId) => {
  const notifications = recipientIds.map((recipient) => ({
    recipient,
    title,
    message,
    type: 'announcement',
    sender: senderId,
  }));
  return Notification.insertMany(notifications);
};

const deleteNotification = async (notificationId, userId) => {
  const n = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  if (!n) throw new ApiError(404, 'Notification not found');
  return n;
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createAnnouncement,
  deleteNotification,
};