const User = require('../models/User');
const Role = require('../models/Role');
const ErrorResponse = require('../utils/errorResponse');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('roles');
    res.json({
      success: true,
      data: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        roles: (u.roles || []).map(r => ({ id: r._id, name: r.name }))
      }))
    });
  } catch (err) {
    next(err);
  }
};

exports.assignRoleToUser = async (req, res, next) => {
  try {
    const { roleId } = req.body;
    if (!roleId) return next(new ErrorResponse('roleId és obligatori', 400));

    const user = await User.findById(req.params.userId);
    if (!user) return next(new ErrorResponse('Usuari no trobat', 404));

    const role = await Role.findById(roleId).populate('permissions');
    if (!role) return next(new ErrorResponse('El rol no existeix', 404));

    await user.addRole(role._id);

    const populated = await User.findById(user._id).populate({
      path: 'roles',
      populate: { path: 'permissions', model: 'Permission' }
    });

    res.json({
      success: true,
      message: 'Rol assignat correctament',
      data: {
        userId: populated._id,
        roles: populated.roles.map(r => ({
          id: r._id,
          name: r.name,
          permissions: (r.permissions || []).map(p => p.name)
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.removeRoleFromUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(new ErrorResponse('Usuari no trobat', 404));

    // ensure not removing last role
    if (user.roles.length <= 1) return next(new ErrorResponse('No permetre que un usuari quedi sense rol', 400));

    await user.removeRole(req.params.roleId);

    const populated = await User.findById(user._id).populate('roles');
    res.json({
      success: true,
      message: 'Rol eliminat correctament',
      data: {
        userId: populated._id,
        roles: populated.roles.map(r => ({ id: r._id, name: r.name }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserPermissions = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: 'roles',
      populate: { path: 'permissions', model: 'Permission' }
    });
    if (!user) return next(new ErrorResponse('Usuari no trobat', 404));

    const perms = await user.getEffectivePermissions();
    res.json({
      success: true,
      message: 'Permisos efectius de l\'usuari',
      data: { userId: user._id, permissions: perms }
    });
  } catch (err) {
    next(err);
  }
};
