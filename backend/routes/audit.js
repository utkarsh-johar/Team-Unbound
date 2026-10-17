const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// All audit routes require authentication
router.use(isAuthenticated);

// GET /my - get audit logs related to current user
router.get('/my', auditController.getMyAuditLogs);

// GET / - get all audit logs with filters (admin only)
router.get('/', isAdmin, auditController.getAuditLogs);

module.exports = router;
