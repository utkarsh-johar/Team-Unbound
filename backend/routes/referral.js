const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// All referral routes require authentication
router.use(isAuthenticated);

// GET / - list referrals (filtered by role)
router.get('/', referralController.listReferrals);

// POST / - create a referral (alumni only)
router.post('/', hasRole('alumni', 'admin'), referralController.createReferral);

// GET /:id - get referral detail with candidates (alumni only for ranked list)
router.get('/:id', referralController.getReferralDetail);

// POST /:id/select - alumni selects candidate(s) from ranked list
router.post('/:id/select', hasRole('alumni', 'admin'), referralController.selectCandidate);

// POST /:id/generate-invite - generate recruiter invite link
router.post('/:id/generate-invite', hasRole('alumni', 'admin'), referralController.generateInvite);

module.exports = router;
