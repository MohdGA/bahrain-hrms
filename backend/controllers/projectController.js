const Project  = require('../models/Project');
const Employee = require('../models/Employee');

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, manager: req.user._id });
    res.status(201).json({ success: true, data: project });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getProjects = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    const projects = await Project.find(filter)
      .populate('manager', 'firstName lastName')
      .populate('team', 'firstName lastName department')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('manager', 'firstName lastName')
      .populate('team', 'firstName lastName');
    res.json({ success: true, data: project });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const [total, active, completed, onHold, cancelled] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'Active' }),
      Project.countDocuments({ status: 'Completed' }),
      Project.countDocuments({ status: 'On Hold' }),
      Project.countDocuments({ status: 'Cancelled' }),
    ]);
    res.json({ success: true, data: { total, active, completed, onHold, cancelled } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
