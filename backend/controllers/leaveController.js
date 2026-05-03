const LeaveRequest = require('../models/LeaveRequest');
const Employee     = require('../models/Employee');

const daysBetween = (a, b) =>
  Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)) + 1;

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const days = daysBetween(startDate, endDate);
    const emp  = await Employee.findById(req.user._id);

    if (leaveType === 'Hajj') {
      if (emp.religion !== 'Muslim')
        return res.status(400).json({ success: false, message: 'Hajj leave is only for Muslim employees' });
      if (emp.hajjLeaveUsed)
        return res.status(400).json({ success: false, message: 'Hajj leave has already been used' });
      if (days > 14)
        return res.status(400).json({ success: false, message: 'Hajj leave cannot exceed 14 days' });
    }

    if (leaveType === 'Annual' && emp.annualLeaveBalance < days)
      return res.status(400).json({ success: false, message: `Insufficient annual leave balance (${emp.annualLeaveBalance} days available)` });

    const leave = await LeaveRequest.create({
      employee: req.user._id, leaveType, startDate, endDate, days, reason,
    });

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const leaves = await LeaveRequest.find(filter)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reviewLeave = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

    leave.status     = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewNote = reviewNote;
    await leave.save();

    if (status === 'Approved') {
      const emp = await Employee.findById(leave.employee._id);
      if (leave.leaveType === 'Annual') emp.annualLeaveBalance -= leave.days;
      if (leave.leaveType === 'Hajj')   emp.hajjLeaveUsed = true;
      await emp.save();
    }

    res.json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
