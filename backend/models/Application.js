const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job:           { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateName: { type: String, required: true },
  email:         { type: String, required: true },
  phone:         { type: String },
  nationality:   { type: String },
  currentRole:   { type: String },
  experience:    { type: Number },
  resumeUrl:     { type: String },
  coverLetter:   { type: String },
  stage: {
    type: String,
    enum: ['Applied','Screening','Interview','Assessment','Offer','Hired','Rejected'],
    default: 'Applied',
  },
  rating:        { type: Number, min: 1, max: 5 },
  interviewDate: { type: Date },
  interviewNotes:{ type: String },
  offerSalary:   { type: mongoose.Schema.Types.Decimal128 },
  reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  source:        { type: String, enum: ['LinkedIn','Indeed','Referral','Walk-in','Website','Other'], default: 'Website' },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
