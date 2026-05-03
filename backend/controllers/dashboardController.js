const Employee  = require('../models/Employee');
const Payroll   = require('../models/Payroll');
const Document  = require('../models/Document');
const WPS_Log   = require('../models/WPS_Log');
const mongoose  = require('mongoose');

exports.getStats = async (req, res) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalActive,
      newThisMonth,
      resignedThisMonth,
      newLastMonth,
      resignedLastMonth,
      bahrainis,
      expats,
      byDepartment,
      byStatus,
      expiringDocs,
    ] = await Promise.all([
      Employee.countDocuments({ status: 'Active' }),
      Employee.countDocuments({ joinDate: { $gte: monthStart } }),
      Employee.countDocuments({ status: 'Resigned', updatedAt: { $gte: monthStart } }),
      Employee.countDocuments({ joinDate: { $gte: lastMonth, $lte: lastMonthEnd } }),
      Employee.countDocuments({ status: 'Resigned', updatedAt: { $gte: lastMonth, $lte: lastMonthEnd } }),
      Employee.countDocuments({ status: 'Active', isBahraini: true }),
      Employee.countDocuments({ status: 'Active', isBahraini: false }),
      Employee.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Employee.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Document.countDocuments({
        expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        status: { $ne: 'expired' },
      }),
    ]);

    const pctChange = (curr, prev) =>
      prev === 0 ? null : +(((curr - prev) / prev) * 100).toFixed(1);

    const total = byDepartment.reduce((s, d) => s + d.count, 0) || 1;
    const demographics = byDepartment.slice(0, 4).map(d => ({
      name:  d._id || 'Other',
      value: +((d.count / total) * 100).toFixed(1),
      count: d.count,
    }));

    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        totalEmployees:   { value: totalActive,       change: pctChange(totalActive, totalActive) },
        newEmployees:     { value: newThisMonth,      change: pctChange(newThisMonth, newLastMonth) },
        resignedEmployees:{ value: resignedThisMonth, change: pctChange(resignedThisMonth, resignedLastMonth) },
        bahrainis,
        expats,
        bahrainisationRate: totalActive ? +((bahrainis / totalActive) * 100).toFixed(1) : 0,
        demographics,
        statusBreakdown: statusMap,
        expiringDocuments: expiringDocs,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecentEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select('firstName lastName department designation status joinDate isBahraini employeeId')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpiryRadar = async (req, res) => {
  try {
    const in60 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const docs = await Document.find({ expiryDate: { $lte: in60 } })
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ expiryDate: 1 })
      .limit(20);

    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
