const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
  }),
  (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // If user has not selected a role yet, redirect to role selection
    if (!req.user || !req.user.role) {
      return res.redirect(`${frontendUrl}/role-select`);
    }
    return res.redirect(`${frontendUrl}/dashboard`);
  }
);

// Get current authenticated user
router.get('/me', isAuthenticated, authController.getMe);

// Select role (alumni, recruiter, founder)
router.post('/select-role', isAuthenticated, authController.selectRole);

// Logout
router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;
