const Payroll  = require('../models/Payroll');
const Employee = require('../models/Employee');
const { calculateSIO, calculateOvertime } = require('../utils/sioCalculator');

const toNum = (d128) => d128 ? parseFloat(d128.toString()) : 0;
const toD128 = (n) => require('mongoose').Types.Decimal128.fromString(n.toFixed(3));

exports.generatePayroll = async (req, res) => {
  try {
    const { month, year, isRamadanMonth = false } = req.body;

    const employees = await Employee.find({ status: 'Active' });
    const results = [];

    for (const emp of employees) {
      const existing = await Payroll.findOne({ employee: emp._id, month, year });
      if (existing) continue;

      const sio = calculateSIO(emp, { basicSalary: emp.basicSalary });

      const basic    = toNum(emp.basicSalary);
      const housing  = toNum(emp.housingAllowance);
      const transport= toNum(emp.transportAllowance);
      const social   = toNum(emp.socialAllowance);
      const other    = toNum(emp.otherAllowances);
      const gross    = basic + housing + transport + social + other;
      const net      = gross - sio.employeeDeduction;

      const payroll = await Payroll.create({
        employee: emp._id,
        month, year,
        basicSalary:           toD128(basic),
        housingAllowance:      toD128(housing),
        transportAllowance:    toD128(transport),
        socialAllowance:       toD128(social),
        otherAllowances:       toD128(other),
        grossSalary:           toD128(gross),
        netSalary:             toD128(net),
        sioEmployeeDeduction:  toD128(sio.employeeDeduction),
        sioEmployerContribution: toD128(sio.employerContribution),
        eosbFundContribution:  emp.isBahraini ? toD128(0) : toD128(sio.employerContribution),
        isRamadanMonth,
        createdBy: req.user._id,
        wpsStatus: 'draft',
      });
      results.push(payroll);
    }

    res.status(201).json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayrollByMonth = async (req, res) => {
  try {
    const { month, year } = req.params;
    const payrolls = await Payroll.find({ month, year })
      .populate('employee', 'firstName lastName employeeId department isBahraini iban cprNumber')
      .populate('createdBy approvedBy', 'firstName lastName');
    res.json({ success: true, count: payrolls.length, data: payrolls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approvePayroll = async (req, res) => {
  try {
    const { ids } = req.body; // array of payroll IDs
    await Payroll.updateMany(
      { _id: { $in: ids }, wpsStatus: 'draft' },
      { wpsStatus: 'pending_checker', createdBy: req.user._id }
    );
    res.json({ success: true, message: `${ids.length} payrolls submitted for checker review` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkerApprove = async (req, res) => {
  try {
    if (!['finance_manager', 'wrp', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only Finance Manager or WRP can approve' });
    }
    const { ids } = req.body;
    await Payroll.updateMany(
      { _id: { $in: ids }, wpsStatus: 'pending_checker' },
      { wpsStatus: 'approved', approvedBy: req.user._id, approvedAt: new Date() }
    );
    res.json({ success: true, message: 'Payrolls approved for WPS submission' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({
      employee: req.user._id,
      month: req.params.month,
      year: req.params.year,
    }).populate('employee', 'firstName lastName employeeId department designation');
    if (!payroll) return res.status(404).json({ success: false, message: 'Payslip not found' });
    res.json({ success: true, data: payroll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateSIOInvoice = async (req, res) => {
  try {
    const { month, year } = req.params;
    const payrolls = await Payroll.find({ month, year })
      .populate('employee', 'firstName lastName employeeId isBahraini');

    const bahrainiInvoice = [];
    const expatInvoice    = [];

    for (const p of payrolls) {
      const line = {
        employeeId: p.employee.employeeId,
        name: `${p.employee.firstName} ${p.employee.lastName}`,
        basicSalary: toNum(p.basicSalary),
        employerContribution: toNum(p.sioEmployerContribution),
        employeeDeduction: toNum(p.sioEmployeeDeduction),
        total: toNum(p.sioEmployerContribution) + toNum(p.sioEmployeeDeduction),
      };
      p.employee.isBahraini ? bahrainiInvoice.push(line) : expatInvoice.push(line);
    }

    res.json({
      success: true,
      data: {
        month, year,
        bahrainiInvoice,
        expatInvoice,
        bahrainiTotal: bahrainiInvoice.reduce((s, r) => s + r.total, 0).toFixed(3),
        expatTotal:    expatInvoice.reduce((s, r) => s + r.total, 0).toFixed(3),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
