const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',  protect, ctrl.getSettings);
router.put('/',  protect, authorize('admin'), ctrl.updateSettings);

module.exports = router;
