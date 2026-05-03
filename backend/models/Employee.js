const mongoose = require('mongoose');
const { fieldEncryption } = require('mongoose-field-encryption');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, required: true },

  // Personal Info
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  firstNameAr: { type: String, trim: true },
  lastNameAr:  { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female'] },
  nationality: { type: String, required: true },
  religion: { type: String },
  photo: { type: String },

  // Encrypted sensitive fields (PDPL 2026)
  cprNumber:   { type: String, required: true }, // encrypted
  basicSalary: { type: mongoose.Schema.Types.Decimal128, required: true }, // encrypted
  homeAddress: { type: String }, // encrypted

  // Employment
  department: { type: String, required: true },
  designation: { type: String, required: true },
  employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract'], default: 'Full-Time' },
  joinDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['Active', 'On Leave', 'Resigned', 'Terminated'], default: 'Active' },
  isBahraini: { type: Boolean, default: false },

  // Salary Components (BHD - Decimal128 for 3-decimal precision)
  housingAllowance:    { type: mongoose.Schema.Types.Decimal128, default: 0 },
  transportAllowance:  { type: mongoose.Schema.Types.Decimal128, default: 0 },
  socialAllowance:     { type: mongoose.Schema.Types.Decimal128, default: 0 },
  otherAllowances:     { type: mongoose.Schema.Types.Decimal128, default: 0 },

  // Banking (WPS 2.0)
  iban: { type: String }, // BH format: BH29BMAG1299123456BH00
  bankName: { type: String },

  // LMRA / Immigration
  workPermitNumber: { type: String },
  workPermitExpiry: { type: Date },
  passportNumber:   { type: String },
  passportExpiry:   { type: Date },
  cprExpiry:        { type: Date },
  visaNumber:       { type: String },
  visaExpiry:       { type: Date },

  // Leave balances
  annualLeaveBalance:  { type: Number, default: 30 },
  sickLeaveBalance:    { type: Number, default: 15 },
  hajjLeaveUsed:       { type: Boolean, default: false },

  // PDPL Consent
  pdplConsentSigned:   { type: Boolean, default: false },
  pdplConsentDate:     { type: Date },

  // Role
  role: { type: String, enum: ['employee', 'hr_officer', 'finance_manager', 'wrp', 'admin'], default: 'employee' },
  password: { type: String, select: false },

}, { timestamps: true });

// Field-level encryption for PDPL compliance
employeeSchema.plugin(fieldEncryption, {
  fields: ['cprNumber', 'basicSalary', 'homeAddress'],
  secret: process.env.ENCRYPTION_KEY,
  saltGenerator: (secret) => secret.slice(0, 16),
});

// Virtual: full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: years of service
employeeSchema.virtual('yearsOfService').get(function () {
  const start = this.joinDate;
  const end = this.endDate || new Date();
  return Math.floor((end - start) / (1000 * 60 * 60 * 24 * 365));
});

module.exports = mongoose.model('Employee', employeeSchema);
