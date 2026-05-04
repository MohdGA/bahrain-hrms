const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  subject:   { type: String, required: true },
  body:      { type: String, required: true },
  read:      { type: Boolean, default: false },
  readAt:    { type: Date },
  deleted:   { type: Boolean, default: false },
  threadId:  { type: String }, // same threadId = conversation thread
  parentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
