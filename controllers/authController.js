const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const ErrorResponse = require('../utils/errorResponse');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ErrorResponse('Validació incorrecta', 400, errors.array()));

    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return next(new ErrorResponse('Email ja registrat', 400));

    const defaultRole = await Role.findOne({ name: 'user' });
    if (!defaultRole) return next(new ErrorResponse('Rol per defecte no trobat (seed no executat)', 500));

    const user = await User.create({ name, email, password, roles: [defaultRole._id] });

    const token = signToken(user._id);

    const populated = await User.findById(user._id).populate({
      path: 'roles',
      populate: { path: 'permissions', model: 'Permission' }
    });

    const effectivePermissions = await populated.getEffectivePermissions();

    res.status(201).json({
      success: true,
      message: 'Usuari creat correctament',
      data: {
        id: populated._id,
        name: populated.name,
        email: populated.email,
        roles: populated.roles.map(r => ({ id: r._id, name: r.name })),
        permissions: effectivePermissions
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorResponse('Email i password són obligatoris', 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new ErrorResponse('Credencials incorrectes', 401));

    const ok = await user.matchPassword(password);
    if (!ok) return next(new ErrorResponse('Credencials incorrectes', 401));

    const token = signToken(user._id);

    const populated = await User.findById(user._id).populate({
      path: 'roles',
      populate: { path: 'permissions', model: 'Permission' }
    });

    const effectivePermissions = await populated.getEffectivePermissions();

    res.status(200).json({
      success: true,
      message: 'Login correcte',
      data: {
        id: populated._id,
        name: populated.name,
        email: populated.email,
        roles: populated.roles.map(r => ({ id: r._id, name: r.name })),
        permissions: effectivePermissions
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const effectivePermissions = await req.user.getEffectivePermissions();
    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        roles: (req.user.roles || []).map(r => ({ id: r._id, name: r.name })),
        permissions: effectivePermissions
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.checkPermission = async (req, res, next) => {
  try {
    const { permission } = req.body;
    if (!permission) return next(new ErrorResponse('permission és obligatori', 400));

    const perm = await Permission.findOne({ name: permission });
    if (!perm) return next(new ErrorResponse('El permís especificat no existeix', 400));

    const has = await req.user.hasPermission(permission);

    if (!has) {
      return res.status(403).json({
        success: false,
        hasPermission: false,
        message: 'No tens permís per fer aquesta acció'
      });
    }

    res.json({
      success: true,
      hasPermission: true,
      message: 'Tens permís per fer aquesta acció'
    });
  } catch (err) {
    next(err);
  }
};
