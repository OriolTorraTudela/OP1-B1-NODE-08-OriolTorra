const { body } = require('express-validator');

const validCategories = ['tasks', 'users', 'roles', 'permissions', 'audit', 'reports'];

exports.createPermissionValidator = [
  body('name')
    .isString().trim().notEmpty().withMessage('name és obligatori')
    .matches(/^[a-z]+:[a-z]+$/).withMessage('name ha de tenir format "categoria:accio" (ex: tasks:create)'),
  body('description').isString().trim().notEmpty().withMessage('description és obligatori'),
  body('category').isString().trim().notEmpty().withMessage('category és obligatori')
    .custom((v) => {
      if (!validCategories.includes(v)) throw new Error('category no vàlida');
      return true;
    })
];

exports.updatePermissionValidator = [
  body('description').optional().isString().trim().notEmpty().withMessage('description no pot ser buit')
];
