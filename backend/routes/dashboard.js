const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats',            protect, ctrl.getStats);
router.get('/recent-employees', protect, ctrl.getRecentEmployees);
router.get('/expiry-radar',     protect, ctrl.getExpiryRadar);

module.exports = router;
