const Document = require('../models/Document');
const Employee = require('../models/Employee');

exports.addDocument = async (req, res) => {
  try {
    const allowed = ['documentType','documentNumber','issueDate','expiryDate','issuedBy','notes'];
    const fields = { employee: req.params.employeeId };
    allowed.forEach(f => { if (req.body[f] !== undefined) fields[f] = req.body[f]; });
    const doc = await Document.create(fields);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getExpiryRadar = async (req, res) => {
  try {
    const today = new Date();
    const in60  = new Date(today); in60.setDate(today.getDate() + 60);

    const expiring = await Document.find({
      expiryDate: { $lte: in60 },
      status: { $ne: 'expired' }
    })
    .populate('employee', 'firstName lastName employeeId department')
    .sort({ expiryDate: 1 });

    const grouped = { expired: [], fifteen: [], thirty: [], sixty: [] };
    expiring.forEach(doc => {
      const days = Math.ceil((doc.expiryDate - today) / (1000 * 60 * 60 * 24));
      if (days <= 0)       grouped.expired.push(doc);
      else if (days <= 15) grouped.fifteen.push(doc);
      else if (days <= 30) grouped.thirty.push(doc);
      else                 grouped.sixty.push(doc);
    });

    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEmployeeDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ employee: req.params.employeeId });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
