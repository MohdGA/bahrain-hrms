const CompanySettings = require('../models/CompanySettings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne({ singleton: 'settings' });
    if (!settings) settings = await CompanySettings.create({ singleton: 'settings' });
    res.json({ success: true, data: settings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await CompanySettings.findOneAndUpdate(
      { singleton: 'settings' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
