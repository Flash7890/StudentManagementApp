const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/grade.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/me', authorize('student'), ctrl.getMyGrades);
router.get('/me/transcript', authorize('student'), ctrl.getMyTranscript);
router.get('/student/:studentId', authorize('admin', 'faculty'), ctrl.getStudentGrades);
router.get('/course/:courseId', authorize('admin', 'faculty'), ctrl.getCourseGrades);
router.post('/assign', authorize('faculty', 'admin'), ctrl.assignGrade);
router.patch('/course/:courseId/publish', authorize('faculty', 'admin'), ctrl.publishGrades);

module.exports = router;