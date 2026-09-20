const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { upload, toBase64 } = require('../middleware/upload.middleware');

router.use(protect);

router.get('/me', authorize('student'), ctrl.getMyProfile);
router.get('/', authorize('admin', 'faculty'), ctrl.getAllStudents);
router.get('/:id', authorize('admin', 'faculty'), ctrl.getStudentById);
router.post('/', authorize('admin'), ctrl.createStudent);
router.patch('/:id', authorize('admin'), upload.single('avatar'), toBase64, ctrl.updateStudent);
router.delete('/:id', authorize('admin'), ctrl.deleteStudent);

module.exports = router;