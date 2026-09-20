const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const ctrl = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// AI calls cost money and are slow, so they get their own tighter limit
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { success: false, message: 'Too many AI requests, please wait a few minutes' },
});

router.use(protect);
router.use(aiLimiter);

router.get('/status', ctrl.getStatus);
router.post('/ask', ctrl.ask);
router.get('/me/summary', authorize('student'), ctrl.summarizeMe);
router.get('/student/:studentId/summary', authorize('admin', 'faculty'), ctrl.summarizeStudent);
router.post('/announcement/draft', authorize('admin'), ctrl.draftAnnouncement);
router.post('/announcement/send', authorize('admin'), ctrl.sendDraftedAnnouncement);
router.post('/course/:courseId/description', authorize('admin', 'faculty'), ctrl.draftCourseDescription);

module.exports = router;
