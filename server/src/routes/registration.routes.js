const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/registration.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/count', ctrl.getPendingCount);
router.get('/', ctrl.getPendingRegistrations);
router.post('/:id/approve', ctrl.approveRegistration);
router.patch('/:id/reject', ctrl.rejectRegistration);

module.exports = router;