const mongoose = require('mongoose');

const wpsLogSchema = new mongoose.Schema({
  batchId:    { type: String, required: true, unique: true },
  month:      { type: Number, required: true },
  year:       { type: Number, required: true },

  // SIF file details
  sifFileName:   { type: String },
  sifFileUrl:    { type: String },
  totalEmployees: { type: Number, default: 0 },
  totalAmount:    { type: mongoose.Schema.Types.Decimal128, default: 0 },

  // Status pipeline
  status: {
    type: String,
    enum: ['draft', 'maker_submitted', 'checker_approved', 'wrp_submitted', 'lmra_accepted', 'lmra_rejected', 'failed'],
    default: 'draft'
  },

  // Maker-Checker-WRP trail
  maker:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  makerAt:   { type: Date },
  checker:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  checkerAt: { type: Date },
  wrp:       { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  wrpAt:     { type: Date },

  // LMRA response
  lmraReference:   { type: String },
  lmraResponseAt:  { type: Date },
  lmraRejectReason: { type: String },

  // Payroll records included
  payrollIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payroll' }],

  // Validation errors caught before submission
  validationErrors: [{
    employeeId: String,
    field: String,
    message: String,
  }],

  submissionMethod: { type: String, default: 'Fawri Transfer' },
  remarks: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('WPS_Log', wpsLogSchema);
