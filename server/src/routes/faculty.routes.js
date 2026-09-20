const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faculty.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/me', authorize('faculty'), ctrl.getMyProfile);
router.get('/', authorize('admin', 'faculty', 'student'), ctrl.getAllFaculty);
router.get('/:id', authorize('admin', 'faculty'), ctrl.getFacultyById);
router.get('/:id/students', authorize('admin', 'faculty'), ctrl.getFacultyStudents);
router.post('/', authorize('admin'), ctrl.createFaculty);
router.patch('/:id', authorize('admin'), ctrl.updateFaculty);
router.delete('/:id', authorize('admin'), ctrl.deleteFaculty);

module.exports = router;