const AuditLog = require('../models/AuditLog');
const ErrorResponse = require('../utils/errorResponse');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { userId, action, startDate, endDate, page = 1, limit = 20 } = req.query;
    const q = {};
    if (userId) q.userId = userId;
    if (action) q.action = action;
    if (startDate || endDate) {
      q.timestamp = {};
      if (startDate) q.timestamp.$gte = new Date(startDate);
      if (endDate) q.timestamp.$lte = new Date(endDate);
    }

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (p - 1) * l;

    const count = await AuditLog.countDocuments(q);
    const logs = await AuditLog.find(q).sort({ timestamp: -1 }).skip(skip).limit(l);

    res.json({ success: true, count, data: logs });
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return next(new ErrorResponse('Log no trobat', 404));
    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

exports.getUserAuditLogs = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (p - 1) * l;

    const logs = await AuditLog.getByUser(req.params.userId, l, skip);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

exports.getAuditStats = async (req, res, next) => {
  try {
    const stats = await AuditLog.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
