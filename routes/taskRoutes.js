const express = require('express');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');
const { createTaskValidator, updateTaskValidator } = require('../middleware/validators/taskValidators');
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

// Auth first
router.use(auth);
// Audit for write + sensitive reads not needed here, but we do write audits
router.use(auditMiddleware());

router.get('/', checkPermission('tasks:read'), getTasks);
router.get('/:id', checkPermission('tasks:read'), getTaskById);
router.post('/', checkPermission('tasks:create'), createTaskValidator, createTask);
router.put('/:id', checkPermission('tasks:update'), updateTaskValidator, updateTask);
router.delete('/:id', checkPermission('tasks:delete'), deleteTask);

module.exports = router;
