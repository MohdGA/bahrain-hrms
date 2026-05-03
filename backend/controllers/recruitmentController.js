const Job         = require('../models/Job');
const Application = require('../models/Application');
const mongoose    = require('mongoose');

// ── Jobs ──
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, data: job });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    // Attach live applicant counts
    for (const job of jobs) {
      job.applicantCount = await Application.countDocuments({ job: job._id });
    }
    res.json({ success: true, data: jobs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: job });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Applications ──
exports.addApplication = async (req, res) => {
  try {
    const app = await Application.create(req.body);
    res.status(201).json({ success: true, data: app });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getApplications = async (req, res) => {
  try {
    const { jobId, stage } = req.query;
    const filter = {};
    if (jobId) filter.job  = jobId;
    if (stage) filter.stage = stage;
    const apps = await Application.find(filter)
      .populate('job', 'title department')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateApplicationStage = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { ...req.body, reviewedBy: req.user._id },
      { new: true }
    ).populate('job', 'title');
    res.json({ success: true, data: app });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getPipelineStats = async (req, res) => {
  try {
    const stages  = ['Applied','Screening','Interview','Assessment','Offer','Hired','Rejected'];
    const results = await Application.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);
    const map = {};
    results.forEach(r => { map[r._id] = r.count; });
    const pipeline = stages.map(s => ({ stage: s, count: map[s] || 0 }));
    const totalJobs   = await Job.countDocuments({ status: 'Open' });
    const totalApps   = await Application.countDocuments();
    const hired       = map['Hired'] || 0;
    const convRate    = totalApps ? +((hired / totalApps) * 100).toFixed(1) : 0;
    res.json({ success: true, data: { pipeline, totalJobs, totalApps, hired, convRate } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
