const express = require('express');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const auditMiddleware = require('../middleware/auditMiddleware');
const { getAuditLogs, getAuditLogById, getUserAuditLogs, getAuditStats } = require('../controllers/auditController');

const router = express.Router();

router.use(auth);
router.use(auditMiddleware());

router.get('/', checkPermission('audit:read'), getAuditLogs);
router.get('/stats', checkPermission('audit:read'), getAuditStats);
router.get('/user/:userId', checkPermission('audit:read'), getUserAuditLogs);
router.get('/:id', checkPermission('audit:read'), getAuditLogById);

module.exports = router;
