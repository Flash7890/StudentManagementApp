const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', ctrl.getAllCourses);
router.get('/:id', ctrl.getCourseById);
router.get('/:id/students', authorize('admin', 'faculty'), ctrl.getCourseStudents);
router.post('/', authorize('admin'), ctrl.createCourse);
router.patch('/:id', authorize('admin'), ctrl.updateCourse);
router.patch('/:id/assign-faculty', authorize('admin'), ctrl.assignFaculty);
router.delete('/:id', authorize('admin'), ctrl.deleteCourse);

module.exports = router;