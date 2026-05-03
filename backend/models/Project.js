const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  client:      { type: String },
  status:      { type: String, enum: ['Planning','Active','On Hold','Completed','Cancelled'], default: 'Planning' },
  priority:    { type: String, enum: ['Low','Medium','High','Critical'], default: 'Medium' },
  startDate:   { type: Date },
  deadline:    { type: Date },
  progress:    { type: Number, min: 0, max: 100, default: 0 },
  budget:      { type: mongoose.Schema.Types.Decimal128 },
  team:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  manager:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  tags:        [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
