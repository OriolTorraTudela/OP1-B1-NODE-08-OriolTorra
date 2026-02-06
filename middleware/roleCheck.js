/**
 * roleCheck.js (MODIFIED)
 * - Legacy helper: check if user has at least one of the required roles OR admin permission.
 */
const ErrorResponse = require('../utils/errorResponse');

module.exports = function roleCheck(allowedRoleNames = []) {
  return async function(req, res, next) {
    if (!req.user) return next(new ErrorResponse('Not authorized', 401));

    // If user has any role in allowed list => ok
    const roleNames = (req.user.roles || []).map(r => r.name);
    const ok = allowedRoleNames.some(r => roleNames.includes(r));

    if (!ok) {
      return next(new ErrorResponse('No tens permís per accedir a aquest recurs', 403));
    }
    next();
  };
};
