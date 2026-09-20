const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/timetable.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/me', ctrl.getMyTimetable);
router.get('/', authorize('admin', 'faculty'), ctrl.getTimetable);
router.post('/', authorize('admin'), ctrl.createEntry);
router.patch('/:id', authorize('admin'), ctrl.updateEntry);
router.delete('/:id', authorize('admin'), ctrl.deleteEntry);

module.exports = router;