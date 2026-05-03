const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  employee:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  documentType: {
    type: String,
    enum: ['CPR', 'Passport', 'Work Permit', 'Visa', 'Employment Contract', 'Other'],
    required: true,
  },
  documentNumber: { type: String },
  issueDate:      { type: Date },
  expiryDate:     { type: Date, required: true },
  fileUrl:        { type: String },
  status: {
    type: String,
    enum: ['valid', 'expiring_soon', 'expired'],
    default: 'valid',
  },
  alertsSent: {
    sixty:   { type: Boolean, default: false },
    thirty:  { type: Boolean, default: false },
    fifteen: { type: Boolean, default: false },
  },
  notes: { type: String },
}, { timestamps: true });

// Auto-calculate status before save
documentSchema.pre('save', function (next) {
  const today = new Date();
  const daysLeft = Math.ceil((this.expiryDate - today) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0)  this.status = 'expired';
  else if (daysLeft <= 30) this.status = 'expiring_soon';
  else this.status = 'valid';
  next();
});

module.exports = mongoose.model('Document', documentSchema);
