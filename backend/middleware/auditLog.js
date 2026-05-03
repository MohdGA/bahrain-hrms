const AuditLog = require('../models/AuditLog');

const audit = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode < 400 && req.user) {
      await AuditLog.create({
        performedBy: req.user._id,
        action,
        resource,
        resourceId: req.params.id || body?.data?._id,
        description: `${action} on ${resource}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(() => {});
    }
    return originalJson(body);
  };
  next();
};

module.exports = audit;
