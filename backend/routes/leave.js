const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',           protect, ctrl.applyLeave);
router.get('/my',          protect, ctrl.getMyLeaves);
router.get('/',            protect, authorize('admin','hr_officer'), ctrl.getAllLeaves);
router.put('/:id/review',  protect, authorize('admin','hr_officer'), ctrl.reviewLeave);

module.exports = router;
