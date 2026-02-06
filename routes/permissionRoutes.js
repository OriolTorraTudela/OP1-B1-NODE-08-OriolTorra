const express = require('express');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');
const { createPermissionValidator, updatePermissionValidator } = require('../middleware/validators/permissionValidators');
const { createPermission, getAllPermissions, getCategories, updatePermission, deletePermission } = require('../controllers/permissionController');

const router = express.Router();

router.use(auth);
router.use(auditMiddleware());

router.post('/', checkPermission('permissions:manage'), createPermissionValidator, createPermission);
router.get('/', checkPermission('permissions:read'), getAllPermissions);
router.get('/categories', checkPermission('permissions:read'), getCategories);
router.put('/:id', checkPermission('permissions:manage'), updatePermissionValidator, updatePermission);
router.delete('/:id', checkPermission('permissions:manage'), deletePermission);

module.exports = router;
