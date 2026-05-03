const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const audit   = require('../middleware/auditLog');

router.post('/register', protect, authorize('admin', 'hr_officer'), audit('CREATE', 'Employee'), ctrl.register);
router.post('/login', ctrl.login);
router.get('/', protect, authorize('admin', 'hr_officer', 'finance_manager', 'wrp'), audit('READ', 'Employee'), ctrl.getAllEmployees);
router.get('/bahrainisation', protect, ctrl.getBahrainisationStats);
router.get('/:id', protect, audit('READ', 'Employee'), ctrl.getEmployee);
router.put('/:id', protect, authorize('admin', 'hr_officer'), audit('UPDATE', 'Employee'), ctrl.updateEmployee);
router.post('/pdpl-consent', protect, ctrl.signPDPLConsent);

module.exports = router;
