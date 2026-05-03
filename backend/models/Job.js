const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  titleAr:      { type: String, trim: true },
  department:   { type: String, required: true },
  type:         { type: String, enum: ['Full-Time','Part-Time','Contract','Internship'], default: 'Full-Time' },
  location:     { type: String, default: 'Bahrain' },
  salaryMin:    { type: mongoose.Schema.Types.Decimal128 },
  salaryMax:    { type: mongoose.Schema.Types.Decimal128 },
  description:  { type: String },
  requirements: [{ type: String }],
  status:       { type: String, enum: ['Open','Closed','On Hold'], default: 'Open' },
  deadline:     { type: Date },
  postedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  applicantCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
