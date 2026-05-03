const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  action:      { type: String, enum: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT'], required: true },
  resource:    { type: String, required: true }, // e.g. 'Employee', 'Payroll', 'WPS'
  resourceId:  { type: String },
  description: { type: String },
  ipAddress:   { type: String },
  userAgent:   { type: String },
  changes:     { type: mongoose.Schema.Types.Mixed }, // before/after for UPDATE
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
