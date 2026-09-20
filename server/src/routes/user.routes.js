const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { upload, toBase64 } = require('../middleware/upload.middleware');

router.use(protect);

router.get('/profile', ctrl.getProfile);
router.patch('/profile', upload.single('avatar'), toBase64, ctrl.updateProfile);
router.patch('/change-password', ctrl.changePassword);

// Admin only
router.get('/', authorize('admin'), ctrl.getAllUsers);
router.get('/:id', authorize('admin'), ctrl.getUserById);
router.patch('/:id', authorize('admin'), ctrl.updateUser);
router.delete('/:id', authorize('admin'), ctrl.deleteUser);

module.exports = router;