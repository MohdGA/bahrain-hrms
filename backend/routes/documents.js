const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:employeeId', protect, authorize('admin', 'hr_officer'), ctrl.addDocument);
router.get('/expiry-radar', protect, ctrl.getExpiryRadar);
router.get('/:employeeId', protect, ctrl.getEmployeeDocuments);

module.exports = router;
