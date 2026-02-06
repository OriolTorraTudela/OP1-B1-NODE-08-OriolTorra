/**
 * AuditLog model
 * - Stores security/audit events for write operations and sensitive reads.
 */
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: '' },
  action: { type: String, required: true, trim: true },
  resource: { type: String, default: '' },
  resourceType: { type: String, default: '' },
  status: { type: String, enum: ['success', 'error'], required: true },
  changes: { type: Object, default: {} },
  errorMessage: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' }
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

AuditLogSchema.statics.log = async function(userId, action, resource, resourceType, status, changes, req, errorMessage = '') {
  const userName = req?.user?.fullName || req?.user?.email || '';
  const ipAddress = (req?.headers['x-forwarded-for'] || '').split(',')[0].trim() || req?.ip || '';
  const userAgent = req?.get?.('user-agent') || req?.headers?.['user-agent'] || '';
  return this.create({
    userId,
    userName,
    action,
    resource: resource || '',
    resourceType: resourceType || '',
    status,
    changes: changes || {},
    errorMessage: errorMessage || '',
    ipAddress,
    userAgent
  });
};

AuditLogSchema.statics.getByUser = async function(userId, limit = 20, skip = 0) {
  return this.find({ userId }).sort({ timestamp: -1 }).skip(skip).limit(limit);
};

AuditLogSchema.statics.getByAction = async function(action, limit = 20, skip = 0) {
  return this.find({ action }).sort({ timestamp: -1 }).skip(skip).limit(limit);
};

AuditLogSchema.statics.getStats = async function() {
  const totalActions = await this.countDocuments();
  const success = await this.countDocuments({ status: 'success' });
  const errors = await this.countDocuments({ status: 'error' });
  const successRate = totalActions ? (success / totalActions) * 100 : 0;

  const topActionsAgg = await this.aggregate([
    { $group: { _id: '$action', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const topUsersAgg = await this.aggregate([
    { $group: { _id: { userId: '$userId', userName: '$userName' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const recentErrorsAgg = await this.aggregate([
    { $match: { status: 'error' } },
    { $group: { _id: { action: '$action', error: '$errorMessage' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return {
    totalActions,
    successRate: Math.round(successRate * 10) / 10,
    topActions: topActionsAgg.map(a => ({ action: a._id, count: a.count })),
    topUsers: topUsersAgg.map(u => ({ userId: u._id.userId, userName: u._id.userName, count: u.count })),
    recentErrors: recentErrorsAgg.map(e => ({ action: e._id.action, error: e._id.error, count: e.count }))
  };
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);
