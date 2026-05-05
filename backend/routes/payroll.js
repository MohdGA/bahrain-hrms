const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.post('/generate', protect, authorize('admin', 'hr_officer'), ctrl.generatePayroll);
router.get('/:month/:year', protect, authorize('admin','hr_officer','finance_manager','wrp'), ctrl.getPayrollByMonth);
router.put('/approve', protect, authorize('hr_officer', 'admin'), ctrl.approvePayroll);
router.put('/checker-approve', protect, authorize('finance_manager', 'wrp', 'admin'), ctrl.checkerApprove);
router.get('/payslip/:month/:year', protect, ctrl.getPayslip);
router.get('/sio-invoice/:month/:year', protect, authorize('admin', 'finance_manager', 'wrp'), ctrl.generateSIOInvoice);

module.exports = router;
