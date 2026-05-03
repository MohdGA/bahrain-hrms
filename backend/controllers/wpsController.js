const { Parser } = require('json2csv');
const { v4: uuidv4 } = require('uuid');
const Payroll  = require('../models/Payroll');
const WPS_Log  = require('../models/WPS_Log');
const Employee = require('../models/Employee');
const { validateSIFRecord } = require('../utils/wpsValidator');

const toNum = (d128) => d128 ? parseFloat(d128.toString()) : 0;

exports.generateSIF = async (req, res) => {
  try {
    if (!['wrp', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only WRP can generate SIF file' });
    }

    const { month, year } = req.body;
    const payrolls = await Payroll.find({ month, year, wpsStatus: 'approved' })
      .populate('employee');

    if (!payrolls.length) {
      return res.status(400).json({ success: false, message: 'No approved payrolls found for this period' });
    }

    const validationErrors = [];
    const sifRecords = [];

    for (const p of payrolls) {
      const emp = p.employee;
      const errors = validateSIFRecord(emp, p);
      if (errors.length) {
        validationErrors.push({ employeeId: emp.employeeId, errors });
        continue;
      }

      sifRecords.push({
        'CPR Number':       emp.cprNumber,
        'Employee Name':    `${emp.firstName} ${emp.lastName}`,
        'IBAN':             emp.iban,
        'Bank Name':        emp.bankName,
        'Basic Salary':     toNum(p.basicSalary).toFixed(3),
        'Social Allowance': toNum(p.socialAllowance).toFixed(3),
        'Other Allowances': (toNum(p.housingAllowance) + toNum(p.transportAllowance) + toNum(p.otherAllowances)).toFixed(3),
        'Variable Salary':  toNum(p.variablePay).toFixed(3),
        'Deductions':       (toNum(p.sioEmployeeDeduction) + toNum(p.otherDeductions)).toFixed(3),
        'Net Salary':       toNum(p.netSalary).toFixed(3),
        'Month':            month,
        'Year':             year,
        'Payment Method':   'Fawri Transfer',
      });
    }

    if (validationErrors.length) {
      return res.status(422).json({
        success: false,
        message: 'Validation errors found — SIF blocked until resolved',
        validationErrors,
      });
    }

    const fields = Object.keys(sifRecords[0]);
    const parser = new Parser({ fields });
    const csv    = parser.parse(sifRecords);
    const batchId = uuidv4();

    const totalAmount = sifRecords.reduce((s, r) => s + parseFloat(r['Net Salary']), 0);

    await WPS_Log.create({
      batchId,
      month, year,
      sifFileName: `SIF_${year}_${String(month).padStart(2, '0')}_${batchId.slice(0, 8)}.csv`,
      totalEmployees: sifRecords.length,
      totalAmount:    require('mongoose').Types.Decimal128.fromString(totalAmount.toFixed(3)),
      status: 'wrp_submitted',
      payrollIds: payrolls.map(p => p._id),
      wrp: req.user._id,
      wrpAt: new Date(),
      submissionMethod: 'Fawri Transfer',
    });

    await Payroll.updateMany(
      { _id: { $in: payrolls.map(p => p._id) } },
      { wpsStatus: 'submitted', wpsSubmittedAt: new Date(), wpsReference: batchId }
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=SIF_${year}_${month}.csv`);
    res.send(csv);

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWPSLogs = async (req, res) => {
  try {
    const logs = await WPS_Log.find()
      .populate('maker checker wrp', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSIFSample = (req, res) => {
  const sample = [
    {
      'CPR Number': '900123456',
      'Employee Name': 'Ahmed Al Mansoori',
      'IBAN': 'BH29BMAG1299123456BH00',
      'Bank Name': 'Bank of Bahrain and Kuwait',
      'Basic Salary': '450.000',
      'Social Allowance': '50.000',
      'Other Allowances': '100.000',
      'Variable Salary': '0.000',
      'Deductions': '36.000',
      'Net Salary': '564.000',
      'Month': 1,
      'Year': 2026,
      'Payment Method': 'Fawri Transfer',
    },
    {
      'CPR Number': '810987654',
      'Employee Name': 'James Franklin',
      'IBAN': 'BH71NBOK0000000012345678',
      'Bank Name': 'National Bank of Bahrain',
      'Basic Salary': '800.000',
      'Social Allowance': '0.000',
      'Other Allowances': '200.000',
      'Variable Salary': '50.000',
      'Deductions': '0.000',
      'Net Salary': '1050.000',
      'Month': 1,
      'Year': 2026,
      'Payment Method': 'Fawri Transfer',
    },
  ];
  const parser = new Parser({ fields: Object.keys(sample[0]) });
  const csv = parser.parse(sample);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=SIF_Sample_2026.csv');
  res.send(csv);
};
