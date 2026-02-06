const { body } = require('express-validator');

exports.createRoleValidator = [
  body('name').isString().trim().notEmpty().withMessage('name és obligatori'),
  body('description').optional().isString().trim(),
  body('permissions').isArray({ min: 1 }).withMessage('permissions ha de ser un array amb almenys 1 element'),
  body('permissions.*').isString().trim().notEmpty().withMessage('cada permís ha de ser un string (nom del permís)')
];

exports.updateRoleValidator = [
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString().trim(),
  body('permissions').optional().isArray(),
  body('permissions.*').optional().isString().trim().notEmpty()
];
