const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  target:   { type: Number },
  achieved: { type: Number },
  score:    { type: Number, min: 1, max: 5 },
  weight:   { type: Number, default: 1 },
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  employee:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  period:       { type: String, required: true }, // e.g. 'Q1 2026', 'H1 2026'
  periodType:   { type: String, enum: ['Monthly','Quarterly','Half-Yearly','Annual'], default: 'Quarterly' },
  kpis:         [kpiSchema],
  overallScore: { type: Number, min: 1, max: 5 },
  strengths:    { type: String },
  improvements: { type: String },
  goals:        { type: String },
  status:       { type: String, enum: ['Draft','Submitted','Acknowledged'], default: 'Draft' },
  employeeAck:  { type: Boolean, default: false },
  acknowledgedAt:{ type: Date },
}, { timestamps: true });

reviewSchema.pre('save', function(next) {
  if (this.kpis && this.kpis.length) {
    const totalWeight = this.kpis.reduce((s, k) => s + (k.weight || 1), 0);
    const weighted    = this.kpis.reduce((s, k) => s + (k.score || 0) * (k.weight || 1), 0);
    this.overallScore = +(weighted / totalWeight).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('PerformanceReview', reviewSchema);
