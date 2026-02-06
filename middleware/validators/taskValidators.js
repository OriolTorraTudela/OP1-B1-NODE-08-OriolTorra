const { body } = require('express-validator');

exports.createTaskValidator = [
  body('title').isString().trim().notEmpty().withMessage('title és obligatori'),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['pending','in_progress','completed']).withMessage('status no vàlid')
];

exports.updateTaskValidator = [
  body('title').optional().isString().trim().notEmpty(),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['pending','in_progress','completed'])
];
