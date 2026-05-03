const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/recruitmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/pipeline-stats',    protect, ctrl.getPipelineStats);
router.get('/jobs',              protect, ctrl.getJobs);
router.post('/jobs',             protect, authorize('admin','hr_officer'), ctrl.createJob);
router.put('/jobs/:id',          protect, authorize('admin','hr_officer'), ctrl.updateJob);
router.delete('/jobs/:id',       protect, authorize('admin','hr_officer'), ctrl.deleteJob);
router.get('/applications',      protect, ctrl.getApplications);
router.post('/applications',     protect, authorize('admin','hr_officer'), ctrl.addApplication);
router.put('/applications/:id',  protect, authorize('admin','hr_officer'), ctrl.updateApplicationStage);

module.exports = router;
