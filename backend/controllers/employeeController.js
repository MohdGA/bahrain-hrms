const Employee = require('../models/Employee');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { password, position, firstName, lastName, email, department, isBahraini } = req.body;

    if (!password || !firstName || !lastName || !email || !department) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const count  = await Employee.countDocuments();
    const employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;

    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      department,
      isBahraini: isBahraini || false,
      designation:  position || 'Employee',
      nationality:  'Not Specified',
      cprNumber:    `PENDING-${employeeId}`,
      basicSalary:  mongoose.Types.Decimal128.fromString('0'),
      joinDate:     new Date(),
      employeeId,
      password:     hashed,
    });

    const token = signToken(employee._id);

    await createNotification({
      recipient: employee._id,
      type:     'welcome',
      title:    '👋 Welcome to Bahrain HRMS!',
      body:     `Your account has been created. Employee ID: ${employee.employeeId}`,
      link:     '/account',
      priority: 'normal',
      icon:     '👋',
    });

    res.status(201).json({
      success: true,
      token,
      data: { id: employee._id, role: employee.role, name: `${firstName} ${lastName}` },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email }).select('+password');
    if (!employee || !(await bcrypt.compare(password, employee.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(employee._id);
    res.json({ success: true, token, data: { id: employee._id, role: employee.role, name: employee.fullName } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const { department, status, isBahraini, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (isBahraini !== undefined) filter.isBahraini = isBahraini === 'true';

    const total = await Employee.countDocuments(filter);
    const employees = await Employee.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { password, ...updates } = req.body;
    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getBahrainisationStats = async (req, res) => {
  try {
    const total     = await Employee.countDocuments({ status: 'Active' });
    const bahrainis = await Employee.countDocuments({ status: 'Active', isBahraini: true });
    const expats    = total - bahrainis;
    const belowThreshold = await Employee.countDocuments({
      status: 'Active',
      isBahraini: true,
      basicSalary: { $lt: mongoose.Types.Decimal128.fromString('250.000') },
    });
    res.json({
      success: true,
      data: {
        total, bahrainis, expats,
        bahrainisationRate: total ? +((bahrainis / total) * 100).toFixed(2) : 0,
        belowThresholdCount: belowThreshold,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, endDate: req.body.status !== 'Active' ? new Date() : undefined },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: employee });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.signPDPLConsent = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.user._id,
      { pdplConsentSigned: true, pdplConsentDate: new Date() },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
