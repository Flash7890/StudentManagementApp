const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', ctrl.getNotifications);
router.patch('/mark-all-read', ctrl.markAllAsRead);
router.patch('/:id/read', ctrl.markAsRead);
router.delete('/:id', ctrl.deleteNotification);
router.post('/announcement', authorize('admin'), ctrl.createAnnouncement);

module.exports = router;