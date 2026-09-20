const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enrollment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/me', authorize('student'), ctrl.getMyEnrollments);
router.get('/student/:studentId', authorize('admin', 'faculty'), ctrl.getStudentEnrollments);
router.get('/course/:courseId', authorize('admin', 'faculty'), ctrl.getCourseEnrollments);
router.post('/', authorize('admin', 'faculty', 'student'), ctrl.enrollStudent);
router.patch('/:id/drop', authorize('student'), ctrl.dropEnrollment);
router.patch('/:id/status', authorize('admin', 'faculty'), ctrl.updateEnrollmentStatus);

module.exports = router;