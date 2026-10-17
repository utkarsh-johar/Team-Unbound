const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');
const { isAuthenticated } = require('../middleware/auth');

// All consent routes require authentication
router.use(isAuthenticated);

// GET / - get user's consent records
router.get('/', consentController.getConsents);

// POST /grant - grant consent for a source (github_public or github_private)
router.post('/grant', consentController.grantConsent);

// POST /revoke - revoke consent, delete associated data
router.post('/revoke', consentController.revokeConsent);

// DELETE /data - delete all user data (anonymize audit logs)
router.delete('/data', consentController.deleteAllData);

module.exports = router;
