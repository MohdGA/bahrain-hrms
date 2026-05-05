const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/wpsController');
const { protect, authorize } = require('../middleware/auth');
const audit   = require('../middleware/auditLog');

router.post('/generate-sif', protect, authorize('wrp', 'admin'), audit('EXPORT', 'WPS'), ctrl.generateSIF);
router.get('/logs',       protect, authorize('admin','finance_manager','wrp'), ctrl.getWPSLogs);
router.get('/sif-sample', protect, authorize('admin','wrp'), ctrl.getSIFSample);

module.exports = router;
