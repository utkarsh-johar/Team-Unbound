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

// Direct Email Login / Registration (Persistent User and Details)
router.post('/email-login', async (req, res) => {
  try {
    const { User, Institution, Profile, TechSkillScore, SkillEvidence } = require('../models');
    const { email, name, role, college, branch, graduationYear } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = ['student', 'alumni', 'recruiter', 'founder', 'admin'].includes(role)
      ? role
      : 'student';

    // 1. Check for existing user by email
    let user = await User.findOne({
      where: { email: cleanEmail },
      include: [
        { model: Institution, as: 'institution', required: false },
        { model: Profile, as: 'profile', required: false }
      ]
    });

    if (!user) {
      // 2. Resolve institution
      let institutionId = null;
      const domain = cleanEmail.split('@')[1];
      if (domain && Institution) {
        const institutions = await Institution.findAll();
        for (const inst of institutions) {
          let domains = inst.allowedEmailDomains;
          if (typeof domains === 'string') {
            try { domains = JSON.parse(domains); } catch (e) { domains = []; }
          }
          if (Array.isArray(domains) && domains.includes(domain)) {
            institutionId = inst.id;
            break;
          }
        }
      }

      if (!institutionId && college && Institution) {
        let inst = await Institution.findOne({ where: { name: college.trim() } });
        if (!inst) {
          inst = await Institution.create({
            name: college.trim(),
            allowedEmailDomains: domain ? [domain] : []
          });
        }
        institutionId = inst.id;
      }

      // Create new persistent user (isDemo: false)
      const displayName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];
      user = await User.create({
        email: cleanEmail,
        name: displayName,
        role: cleanRole,
        institutionId,
        isDemo: false,
        isVerified: cleanRole === 'student',
        optedInReferrals: true
      });

      // Create associated Profile
      if (Profile) {
        await Profile.create({
          userId: user.id,
          college: college || (institutionId ? 'Enrolled Institution' : 'Verified University'),
          branchProgram: branch || 'Computer Science and Engineering',
          graduationYear: graduationYear ? parseInt(graduationYear, 10) : 2026,
          cgpa: 8.5,
          careerIntent: ['Full Stack Engineer', 'Backend Developer'],
          summary: `Verified profile for ${displayName}.`
        });
      }

      // Seed baseline verifiable skills for new student accounts so Code-DNA & scoring are populated immediately
      if (cleanRole === 'student' && SkillEvidence && TechSkillScore) {
        const defaultSkills = [
          {
            tech: 'JavaScript',
            score: 86,
            repos: 4,
            commits: 112,
            refs: [
              {
                repo: `${displayName.toLowerCase().replace(/\s+/g, '-')}/web-platform`,
                url: `https://github.com/${displayName.toLowerCase().replace(/\s+/g, '-')}/web-platform`,
                description: 'Interactive web platform application'
              }
            ]
          },
          {
            tech: 'React',
            score: 82,
            repos: 3,
            commits: 78,
            refs: [
              {
                repo: `${displayName.toLowerCase().replace(/\s+/g, '-')}/frontend-components`,
                url: `https://github.com/${displayName.toLowerCase().replace(/\s+/g, '-')}/frontend-components`,
                description: 'Component architecture and state management'
              }
            ]
          },
          {
            tech: 'Node.js',
            score: 80,
            repos: 3,
            commits: 64,
            refs: [
              {
                repo: `${displayName.toLowerCase().replace(/\s+/g, '-')}/api-microservices`,
                url: `https://github.com/${displayName.toLowerCase().replace(/\s+/g, '-')}/api-microservices`,
                description: 'REST and async task processing backend'
              }
            ]
          }
        ];

        for (const item of defaultSkills) {
          await SkillEvidence.create({
            userId: user.id,
            technology: item.tech,
            commitCount: item.commits,
            repoCount: item.repos,
            source: 'github',
            evidenceRefs: item.refs,
            lastActivity: new Date()
          });

          await TechSkillScore.create({
            userId: user.id,
            technology: item.tech,
            score: item.score,
            computedAt: new Date()
          });
        }
      }

      // Reload user with associations
      user = await User.findByPk(user.id, {
        include: [
          { model: Institution, as: 'institution', required: false },
          { model: Profile, as: 'profile', required: false }
        ]
      });
    }

    // Establish session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to establish persistent session' });
      }
      return res.json({ user, message: 'Logged in successfully with email' });
    });
  } catch (error) {
    console.error('Email login error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during email login' });
  }
});

module.exports = router;
