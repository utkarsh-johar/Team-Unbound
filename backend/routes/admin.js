const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

// GET /pending-alumni - list alumni pending verification
router.get('/pending-alumni', adminController.getPendingAlumni);

// POST /verify-alumni/:userId - approve or reject alumni
router.post('/verify-alumni/:userId', adminController.verifyAlumni);

// GET /appeals - list pending appeals
router.get('/appeals', adminController.getAppeals);

// POST /appeals/:id/decide - decide an appeal (upheld or reversed)
router.post('/appeals/:id/decide', adminController.decideAppeal);

// GET /audit-logs - list audit logs with filters
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
