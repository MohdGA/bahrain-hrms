const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType:   { type: String, enum: ['Annual', 'Sick', 'Hajj', 'Unpaid', 'Emergency'], required: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  days:        { type: Number, required: true },
  reason:      { type: String },
  status:      { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reviewedAt:  { type: Date },
  reviewNote:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveSchema);
