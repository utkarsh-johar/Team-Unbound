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

// 1-Click Demo Login for Local Evaluation (seeds created in seed.js)
router.post('/demo-login', async (req, res) => {
  try {
    const { User, Institution, Profile } = require('../models');
    const { role } = req.body;
    const targetRole = role || 'student';
    const emailMap = {
      student: 'student1@demo.edu',
      alumni: 'alumni1@demo.edu',
      recruiter: 'recruiter@company.com',
      founder: 'founder@startup.com',
      admin: 'admin@demo.edu',
    };
    const targetEmail = emailMap[targetRole] || 'student1@demo.edu';
    const user = await User.findOne({
      where: { email: targetEmail },
      include: [
        { model: Institution, as: 'institution', required: false },
        { model: Profile, as: 'profile', required: false }
      ]
    });
    if (!user) {
      return res.status(404).json({ error: `Demo user for role ${targetRole} not found. Run seed script.` });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to establish demo session' });
      }
      return res.json({ user });
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
