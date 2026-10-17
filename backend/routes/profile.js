const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Profile routes require authentication
router.use(isAuthenticated);

// GET / - get current user's profile
router.get('/', profileController.getProfile);

// PUT / - update profile
router.put('/', profileController.updateProfile);

// GET /code-dna - get Code-DNA data (skill evidence + scores)
router.get('/code-dna', profileController.getCodeDna);

// GET /:userId/public - get another user's public profile (limited)
router.get('/:userId/public', profileController.getPublicProfile);

module.exports = router;
