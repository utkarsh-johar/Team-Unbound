const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const { isAuthenticated } = require('../middleware/auth');

// GET /connect - redirect to GitHub OAuth
router.get('/connect', isAuthenticated, githubController.connect);

// GET /callback - handle OAuth callback from GitHub
router.get('/callback', githubController.callback);

// POST /sync - re-sync GitHub data
router.post('/sync', isAuthenticated, githubController.sync);

// GET /status - check if GitHub is connected
router.get('/status', isAuthenticated, githubController.getStatus);

module.exports = router;
