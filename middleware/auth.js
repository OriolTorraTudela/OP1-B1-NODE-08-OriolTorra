const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate({
      path: 'roles',
      populate: { path: 'permissions', model: 'Permission' }
    });

    if (!user) return next(new ErrorResponse('Not authorized', 401));

    // attach minimal user object used by audit + permission middleware
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized', 401));
  }
};
