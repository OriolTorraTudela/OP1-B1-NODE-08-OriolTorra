/**
 * adminRoutes.js 
 * - Adds user role assignment + user permissions endpoints.
 */
const express = require('express');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');

const roleRoutes = require('./roleRoutes');
const permissionRoutes = require('./permissionRoutes');
const auditRoutes = require('./auditRoutes');

const { getUsers, assignRoleToUser, removeRoleFromUser, getUserPermissions } = require('../controllers/adminController');

const router = express.Router();

// Nested resources: /api/admin/...
router.use(auth);
router.use(auditMiddleware());

// Users admin
router.get('/users', checkPermission('users:read'), getUsers);
router.post('/users/:userId/roles', checkPermission('users:manage'), assignRoleToUser);
router.delete('/users/:userId/roles/:roleId', checkPermission('users:manage'), removeRoleFromUser);
router.get('/users/:userId/permissions', checkPermission('users:read'), getUserPermissions);

// Roles / Permissions / Audit as subrouters
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/audit-logs', auditRoutes);

module.exports = router;
