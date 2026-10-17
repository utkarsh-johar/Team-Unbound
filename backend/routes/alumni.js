const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// All alumni routes require authentication and alumni/admin role
router.use(isAuthenticated);

// GET /dashboard - get alumni dashboard data
router.get('/dashboard', hasRole('alumni', 'admin'), alumniController.getDashboard);

// GET /credibility - get credibility score with history
router.get('/credibility', alumniController.getCredibility);

// POST /verify - submit verification request
router.post('/verify', hasRole('alumni', 'admin'), alumniController.submitVerification);

module.exports = router;
