/**
 * Audit middleware
 * - Logs:
 *   - All POST/PUT/DELETE requests
 *   - Sensitive GET requests under /api/admin/*
 */
const AuditLog = require('../models/AuditLog');

module.exports = function auditMiddleware() {
  return async function(req, res, next) {
    const isWrite = ['POST', 'PUT', 'DELETE'].includes(req.method);
    const isSensitiveRead = req.method === 'GET' && (req.originalUrl || '').includes('/api/admin/');
    if (!isWrite && !isSensitiveRead) return next();

    if (!req.user) return next();

    const action = actionFromReq(req);
    const resourceType = resourceTypeFromReq(req);
    const resource = (req.params && (req.params.id || req.params.userId || req.params.roleId)) ? 
      (req.params.id || req.params.userId || req.params.roleId) : '';

    // Capture response status by wrapping res.json
    const originalJson = res.json.bind(res);

    res.json = async (payload) => {
      try {
        const status = res.statusCode >= 400 ? 'error' : 'success';
        const changes = payload?.changes || payload?.data?.changes || {};
        const errorMessage = status === 'error' ? (payload?.error || payload?.message || 'Request failed') : '';

        await AuditLog.log(
          req.user._id,
          action,
          resource,
          resourceType,
          status,
          changes,
          req,
          errorMessage
        );
      } catch (e) {
      }
      return originalJson(payload);
    };

    next();
  };
};

function actionFromReq(req) {
  const path = req.originalUrl || '';
  if (path.includes('/api/tasks')) {
    if (req.method === 'GET') return 'tasks:read';
    if (req.method === 'POST') return 'tasks:create';
    if (req.method === 'PUT') return 'tasks:update';
    if (req.method === 'DELETE') return 'tasks:delete';
  }
  if (path.includes('/api/admin/permissions')) {
    if (req.method === 'GET') return 'permissions:read';
    return 'permissions:manage';
  }
  if (path.includes('/api/admin/roles')) {
    if (req.method === 'GET') return 'roles:read';
    return 'roles:manage';
  }
  if (path.includes('/api/admin/users')) {
    if (req.method === 'GET') return 'users:read';
    return 'users:manage';
  }
  if (path.includes('/api/admin/audit-logs')) return 'audit:read';
  return 'unknown';
}

function resourceTypeFromReq(req) {
  const path = req.originalUrl || '';
  if (path.includes('/api/tasks')) return 'task';
  if (path.includes('/api/admin/permissions')) return 'permission';
  if (path.includes('/api/admin/roles')) return 'role';
  if (path.includes('/api/admin/users')) return 'user';
  if (path.includes('/api/admin/audit-logs')) return 'audit';
  return 'unknown';
}
