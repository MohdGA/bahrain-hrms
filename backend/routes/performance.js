const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/team-scores',        protect, ctrl.getTeamScores);
router.get('/',                   protect, ctrl.getReviews);
router.post('/',                  protect, authorize('admin','hr_officer'), ctrl.createReview);
router.put('/:id',                protect, authorize('admin','hr_officer'), ctrl.updateReview);
router.put('/:id/acknowledge',    protect, ctrl.acknowledgeReview);

module.exports = router;
