const PerformanceReview = require('../models/PerformanceReview');
const Employee          = require('../models/Employee');

exports.createReview = async (req, res) => {
  try {
    const review = await PerformanceReview.create({ ...req.body, reviewer: req.user._id });
    res.status(201).json({ success: true, data: review });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getReviews = async (req, res) => {
  try {
    const { employeeId, period, status } = req.query;
    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (period)     filter.period   = period;
    if (status)     filter.status   = status;
    const reviews = await PerformanceReview.find(filter)
      .populate('employee', 'firstName lastName employeeId department designation')
      .populate('reviewer', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('employee', 'firstName lastName')
      .populate('reviewer', 'firstName lastName');
    res.json({ success: true, data: review });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.acknowledgeReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.employee.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'You can only acknowledge your own review' });
    review.employeeAck    = true;
    review.acknowledgedAt = new Date();
    review.status         = 'Acknowledged';
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getTeamScores = async (req, res) => {
  try {
    const scores = await PerformanceReview.aggregate([
      { $match: { status: { $in: ['Submitted','Acknowledged'] } } },
      { $group: {
        _id: '$employee',
        avgScore:  { $avg: '$overallScore' },
        reviews:   { $sum: 1 },
        lastScore: { $last: '$overallScore' },
      }},
      { $lookup: { from: 'employees', localField: '_id', foreignField: '_id',
          as: 'emp', pipeline: [{ $project: { firstName:1, lastName:1, department:1, designation:1 } }] } },
      { $unwind: '$emp' },
      { $sort: { avgScore: -1 } },
    ]);
    res.json({ success: true, data: scores });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
