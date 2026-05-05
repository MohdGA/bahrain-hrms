const Message  = require('../models/Message');
const Employee = require('../models/Employee');
const { createNotification } = require('./notificationController');
const { v4: uuidv4 } = require('uuid');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, body, parentId } = req.body;
    if (!recipientId || !subject || !body)
      return res.status(400).json({ success: false, message: 'Recipient, subject and body are required' });

    const recipient = await Employee.findById(recipientId);
    if (!recipient) return res.status(404).json({ success: false, message: 'Recipient not found' });

    const threadId = parentId
      ? (await Message.findById(parentId))?.threadId || uuidv4()
      : uuidv4();

    const message = await Message.create({
      sender: req.user._id, recipient: recipientId,
      subject, body, threadId, parentId: parentId || undefined,
    });

    // Notify the recipient
    await createNotification({
      recipient: recipientId,
      type: 'new_message',
      title: `New message from ${req.user.firstName || 'HR'}`,
      body: subject,
      link: '/messages',
      icon: '💬',
      priority: 'normal',
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user._id, deleted: false })
      .populate('sender', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 });
    const unreadCount = await Message.countDocuments({ recipient: req.user._id, read: false, deleted: false });
    res.json({ success: true, data: messages, unreadCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSent = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user._id, deleted: false })
      .populate('recipient', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMessage = async (req, res) => {
  try {
    const msg = await Message.findOne({
      _id: req.params.id,
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    })
      .populate('sender', 'firstName lastName department')
      .populate('recipient', 'firstName lastName department');
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    // Auto-mark as read if recipient is reading
    if (msg.recipient._id.toString() === req.user._id.toString() && !msg.read) {
      msg.read = true; msg.readAt = new Date();
      await msg.save();
    }
    res.json({ success: true, data: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.findOneAndUpdate(
      { _id: req.params.id, $or: [{ sender: req.user._id }, { recipient: req.user._id }] },
      { deleted: true }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ recipient: req.user._id, read: false, deleted: false });
    res.json({ success: true, count });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ _id: { $ne: req.user._id }, status: 'Active' })
      .select('firstName lastName employeeId department designation');
    res.json({ success: true, data: employees });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
