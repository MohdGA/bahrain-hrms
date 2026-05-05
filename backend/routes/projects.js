const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats',  protect, ctrl.getStats);
router.get('/',       protect, ctrl.getProjects);
router.post('/',      protect, authorize('admin','hr_officer','finance_manager'), ctrl.createProject);
router.put('/:id',    protect, authorize('admin','hr_officer','finance_manager'), ctrl.updateProject);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteProject);

module.exports = router;
