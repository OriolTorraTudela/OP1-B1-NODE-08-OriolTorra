const { validationResult } = require('express-validator');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.createRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ErrorResponse('Validació incorrecta', 400, errors.array()));

    const { name, description, permissions } = req.body;

    const exists = await Role.findOne({ name: name.toLowerCase() });
    if (exists) return next(new ErrorResponse('Ja existeix un rol amb aquest nom', 400));

    const perms = await Permission.find({ name: { $in: permissions } });
    if (perms.length !== permissions.length) return next(new ErrorResponse('Un o més permisos no existeixen', 400));

    const role = await Role.create({
      name: name.toLowerCase(),
      description: description || '',
      permissions: perms.map(p => p._id),
      isSystemRole: false
    });

    const populated = await Role.findById(role._id).populate('permissions');

    res.status(201).json({
      success: true,
      message: 'Rol creat correctament',
      data: {
        id: populated._id,
        name: populated.name,
        description: populated.description,
        permissions: populated.permissions.map(p => ({ id: p._id, name: p.name, description: p.description })),
        createdAt: populated.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().populate('permissions').sort({ name: 1 });
    res.json({
      success: true,
      data: roles.map(r => ({
        id: r._id,
        name: r.name,
        description: r.description,
        isSystemRole: r.isSystemRole,
        permissions: (r.permissions || []).map(p => ({ id: p._id, name: p.name, description: p.description }))
      }))
    });
  } catch (err) {
    next(err);
  }
};

exports.getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions');
    if (!role) return next(new ErrorResponse('Rol no trobat', 404));

    res.json({
      success: true,
      data: {
        id: role._id,
        name: role.name,
        description: role.description,
        isSystemRole: role.isSystemRole,
        permissions: (role.permissions || []).map(p => ({ id: p._id, name: p.name, description: p.description }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ErrorResponse('Validació incorrecta', 400, errors.array()));

    const role = await Role.findById(req.params.id);
    if (!role) return next(new ErrorResponse('Rol no trobat', 404));

    if (role.isSystemRole && req.body.name && req.body.name.toLowerCase() !== role.name) {
      return next(new ErrorResponse('No es pot renombrar rols del sistema (admin, user)', 403));
    }

    if (req.body.name !== undefined) role.name = req.body.name.toLowerCase();
    if (req.body.description !== undefined) role.description = req.body.description;

    if (req.body.permissions !== undefined) {
      const perms = await Permission.find({ name: { $in: req.body.permissions } });
      if (perms.length !== req.body.permissions.length) return next(new ErrorResponse('Un o més permisos no existeixen', 400));
      role.permissions = perms.map(p => p._id);
    }

    await role.save();
    const populated = await Role.findById(role._id).populate('permissions');

    res.json({
      success: true,
      message: 'Rol actualitzat correctament',
      data: {
        id: populated._id,
        name: populated.name,
        description: populated.description,
        isSystemRole: populated.isSystemRole,
        permissions: populated.permissions.map(p => ({ id: p._id, name: p.name, description: p.description }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return next(new ErrorResponse('Rol no trobat', 404));

    if (role.isSystemRole) return next(new ErrorResponse('No pots eliminar un rol del sistema', 403));

    // Reassign users having this role to default "user"
    const defaultRole = await Role.findOne({ name: 'user' });
    if (!defaultRole) return next(new ErrorResponse('Rol per defecte no trobat', 500));

    const users = await User.find({ roles: role._id });
    for (const u of users) {
      // remove the role and ensure at least default role remains
      u.roles = u.roles.filter(r => r.toString() !== role._id.toString());
      if (u.roles.length === 0) u.roles = [defaultRole._id];
      await u.save();
    }

    await role.deleteOne();
    res.json({ success: true, message: 'Rol eliminat correctament' });
  } catch (err) {
    next(err);
  }
};

exports.addPermissionToRole = async (req, res, next) => {
  try {
    const { permissionName } = req.body;
    if (!permissionName) return next(new ErrorResponse('permissionName és obligatori', 400));

    const role = await Role.findById(req.params.id);
    if (!role) return next(new ErrorResponse('Rol no trobat', 404));

    const perm = await Permission.findOne({ name: permissionName });
    if (!perm) return next(new ErrorResponse('Permís no trobat', 404));

    await role.addPermission(perm._id);
    const populated = await Role.findById(role._id).populate('permissions');

    res.json({
      success: true,
      message: 'Permís afegit al rol',
      data: {
        id: populated._id,
        name: populated.name,
        permissions: populated.permissions.map(p => p.name)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.removePermissionFromRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return next(new ErrorResponse('Rol no trobat', 404));

    await role.removePermission(req.params.permissionId);
    const populated = await Role.findById(role._id).populate('permissions');

    res.json({
      success: true,
      message: 'Permís eliminat del rol',
      data: {
        id: populated._id,
        name: populated.name,
        permissions: populated.permissions.map(p => p.name)
      }
    });
  } catch (err) {
    next(err);
  }
};
