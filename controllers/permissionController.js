const { validationResult } = require('express-validator');
const Permission = require('../models/Permission');
const ErrorResponse = require('../utils/errorResponse');

exports.createPermission = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ErrorResponse('Validació incorrecta', 400, errors.array()));

    const { name, description, category } = req.body;

    const exists = await Permission.findOne({ name });
    if (exists) return next(new ErrorResponse('Ja existeix un permís amb aquest nom', 400));

    const perm = await Permission.create({ name, description, category, isSystemPermission: false });

    res.status(201).json({
      success: true,
      message: 'Permís creat correctament',
      data: {
        id: perm._id,
        name: perm.name,
        description: perm.description,
        category: perm.category,
        createdAt: perm.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllPermissions = async (req, res, next) => {
  try {
    const perms = await Permission.find().sort({ category: 1, name: 1 });
    // group by category
    const grouped = perms.reduce((acc, p) => {
      acc[p.category] = acc[p.category] || [];
      acc[p.category].push({ id: p._id, name: p.name, description: p.description, isSystemPermission: p.isSystemPermission });
      return acc;
    }, {});
    res.json({ success: true, data: grouped });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Permission.distinct('category');
    res.json({ success: true, data: categories.sort() });
  } catch (err) {
    next(err);
  }
};

exports.updatePermission = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ErrorResponse('Validació incorrecta', 400, errors.array()));

    const perm = await Permission.findById(req.params.id);
    if (!perm) return next(new ErrorResponse('Permís no trobat', 404));

    if (req.body.description !== undefined) perm.description = req.body.description;
    await perm.save();

    res.json({
      success: true,
      message: 'Permís actualitzat correctament',
      data: { id: perm._id, name: perm.name, description: perm.description, category: perm.category }
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePermission = async (req, res, next) => {
  try {
    const perm = await Permission.findById(req.params.id);
    if (!perm) return next(new ErrorResponse('Permís no trobat', 404));

    if (perm.isSystemPermission) return next(new ErrorResponse('No pots eliminar permisos del sistema', 403));

    await perm.deleteOne();
    res.json({ success: true, message: 'Permís eliminat correctament' });
  } catch (err) {
    next(err);
  }
};
