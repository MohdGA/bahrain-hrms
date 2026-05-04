const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: {
    type: String,
    enum: ['leave_request','leave_approved','leave_rejected','document_expiry',
           'payroll_ready','wps_submitted','performance_review','new_message',
           'birthday','welcome','system'],
    required: true,
  },
  title:    { type: String, required: true },
  body:     { type: String },
  link:     { type: String }, // frontend route to navigate to
  read:     { type: Boolean, default: false },
  readAt:   { type: Date },
  icon:     { type: String }, // emoji or icon name
  priority: { type: String, enum: ['low','normal','high'], default: 'normal' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
