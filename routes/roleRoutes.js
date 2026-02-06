const express = require('express');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');
const { createRoleValidator, updateRoleValidator } = require('../middleware/validators/roleValidators');
const { createRole, getAllRoles, getRoleById, updateRole, deleteRole, addPermissionToRole, removePermissionFromRole } = require('../controllers/roleController');

const router = express.Router();

router.use(auth);
router.use(auditMiddleware());

router.post('/', checkPermission('roles:manage'), createRoleValidator, createRole);
router.get('/', checkPermission('roles:read'), getAllRoles);
router.get('/:id', checkPermission('roles:read'), getRoleById);
router.put('/:id', checkPermission('roles:manage'), updateRoleValidator, updateRole);
router.delete('/:id', checkPermission('roles:manage'), deleteRole);
router.post('/:id/permissions', checkPermission('roles:manage'), addPermissionToRole);
router.delete('/:id/permissions/:permissionId', checkPermission('roles:manage'), removePermissionFromRole);

module.exports = router;
