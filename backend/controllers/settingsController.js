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
    const allowed = [
      'companyName','companyNameAr','crNumber','industry','address','phone','email',
      'website','logo','currency','dateFormat','timezone','language',
      'workingDays','workingHours','fiscalYearStart',
    ];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const settings = await CompanySettings.findOneAndUpdate(
      { singleton: 'settings' },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
