const ErrorResponse = require('../utils/errorResponse');
const AuditLog = require('../models/AuditLog');

/**
 * checkPermission(requiredPermission)
 * - Ensures req.user exists and has the required permission.
 * - If denied, logs an audit event (status=error).
 */
module.exports = function checkPermission(requiredPermission) {
  return async function(req, res, next) {
    try {
      if (!req.user) return next(new ErrorResponse('Not authorized', 401));

      const has = await req.user.hasPermission(requiredPermission);
      req.permission = requiredPermission;

      if (!has) {
        // log denied access as audit
        await AuditLog.log(
          req.user._id,
          requiredPermission,
          req.params?.id || '',
          inferResourceType(req),
          'error',
          {},
          req,
          'Permission denied'
        );

        return next(new ErrorResponse('No tens permís per fer aquesta acció', 403, { permission: requiredPermission }));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

function inferResourceType(req) {
  const p = req.originalUrl || '';
  if (p.includes('/tasks')) return 'task';
  if (p.includes('/admin/roles')) return 'role';
  if (p.includes('/admin/permissions')) return 'permission';
  if (p.includes('/admin/users')) return 'user';
  if (p.includes('/audit-logs')) return 'audit';
  return 'unknown';
}
