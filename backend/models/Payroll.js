const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month:      { type: Number, required: true }, // 1-12
  year:       { type: Number, required: true },

  // Salary Components (BHD - 3 decimal Decimal128)
  basicSalary:         { type: mongoose.Schema.Types.Decimal128, required: true },
  housingAllowance:    { type: mongoose.Schema.Types.Decimal128, default: 0 },
  transportAllowance:  { type: mongoose.Schema.Types.Decimal128, default: 0 },
  socialAllowance:     { type: mongoose.Schema.Types.Decimal128, default: 0 },
  otherAllowances:     { type: mongoose.Schema.Types.Decimal128, default: 0 },
  overtimePay:         { type: mongoose.Schema.Types.Decimal128, default: 0 },
  variablePay:         { type: mongoose.Schema.Types.Decimal128, default: 0 },

  // Deductions
  sioEmployeeDeduction:  { type: mongoose.Schema.Types.Decimal128, default: 0 },
  incomeTaxDeduction:    { type: mongoose.Schema.Types.Decimal128, default: 0 },
  otherDeductions:       { type: mongoose.Schema.Types.Decimal128, default: 0 },
  absenceDeduction:      { type: mongoose.Schema.Types.Decimal128, default: 0 },

  // Employer Contributions
  sioEmployerContribution: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  eosbFundContribution:    { type: mongoose.Schema.Types.Decimal128, default: 0 },

  // Totals
  grossSalary: { type: mongoose.Schema.Types.Decimal128, required: true },
  netSalary:   { type: mongoose.Schema.Types.Decimal128, required: true },

  // WPS 2.0 Status
  wpsStatus: {
    type: String,
    enum: ['draft', 'pending_checker', 'approved', 'submitted', 'failed'],
    default: 'draft'
  },
  wpsSubmittedAt: { type: Date },
  wpsReference:   { type: String },

  // Ramadan adjustments
  isRamadanMonth:       { type: Boolean, default: false },
  ramadanOvertimeRate:  { type: Number, default: 1.25 },

  // Overtime breakdown
  overtimeHours:      { type: Number, default: 0 },
  overtimeDayHours:   { type: Number, default: 0 },
  overtimeNightHours: { type: Number, default: 0 },

  // Maker-Checker workflow
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedAt:  { type: Date },
  remarks:     { type: String },

}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
