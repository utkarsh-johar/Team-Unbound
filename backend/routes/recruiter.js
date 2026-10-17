const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// GET /invite/:token - verify and accept invite
router.get('/invite/:token', recruiterController.acceptInvite);

// Routes below require authentication
router.use(isAuthenticated);

// GET /referrals - list referrals recruiter is invited to
router.get('/referrals', hasRole('recruiter', 'admin'), recruiterController.getReferrals);

// POST /outcome - submit referral outcome
router.post('/outcome', hasRole('recruiter', 'admin'), recruiterController.submitOutcome);

module.exports = router;
