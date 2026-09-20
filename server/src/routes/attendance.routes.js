const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/me', authorize('student'), ctrl.getMyAttendance);
router.get('/me/summary', authorize('student'), ctrl.getMyAttendanceSummary);
router.get('/course/:courseId', authorize('admin', 'faculty'), ctrl.getAttendanceByCourse);
router.get('/student/:studentId', authorize('admin', 'faculty'), ctrl.getStudentAttendance);
router.get('/student/:studentId/course/:courseId/percentage', authorize('admin', 'faculty'), ctrl.getAttendancePercentage);
router.post('/mark', authorize('faculty', 'admin'), ctrl.markAttendance);

module.exports = router;