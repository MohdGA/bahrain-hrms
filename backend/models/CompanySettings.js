const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  singleton:     { type: String, default: 'settings', unique: true },
  companyName:   { type: String, default: 'My Company' },
  companyNameAr: { type: String },
  crNumber:      { type: String },
  industry:      { type: String },
  address:       { type: String },
  phone:         { type: String },
  email:         { type: String },
  logo:          { type: String },
  ramadanMode:   { type: Boolean, default: false },
  ramadanYear:   { type: Number },
  workingHours: {
    normal:   { type: Number, default: 8 },
    ramadan:  { type: Number, default: 6 },
    perWeek:  { type: Number, default: 48 },
  },
  currency:      { type: String, default: 'BHD' },
  timezone:      { type: String, default: 'Asia/Bahrain' },
  payrollCutoff: { type: Number, default: 25 },
  wpsDeadlineDay:{ type: Number, default: 10 },
  notifications: {
    documentExpiry: { type: Boolean, default: true },
    payrollReminder:{ type: Boolean, default: true },
    leaveApproval:  { type: Boolean, default: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', settingsSchema);
