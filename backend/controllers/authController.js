const { User, Profile, Institution, AlumniCredibility, AuditLog } = require('../models');
const appConfig = require('../config/appConfig');

/**
 * Get current authenticated user with profile, institution, and credibility (if alumni)
 */
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      // Check if user is in pending role selection stage
      if (req.session && req.session.pendingUser) {
        return res.json({
          user: {
            ...req.session.pendingUser,
            role: null,
            pendingRoleSelection: true
          }
        });
      }
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let user;
    try {
      user = await User.findByPk(req.user.id, {
        include: [
          ...(Institution ? [{ model: Institution, as: 'institution', required: false }] : []),
          ...(Profile ? [{ model: Profile, as: 'profile', required: false }] : []),
          ...(AlumniCredibility ? [{ model: AlumniCredibility, as: 'alumniCredibility', required: false }] : [])
        ]
      });
    } catch (assocError) {
      // Fallback if association aliases differ
      user = await User.findByPk(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.toJSON ? user.toJSON() : { ...user };

    if (!userData.institution && userData.institutionId && Institution) {
      userData.institution = await Institution.findByPk(userData.institutionId);
    }

    if (!userData.profile && Profile) {
      userData.profile = await Profile.findOne({ where: { userId: user.id } });
    }

    if (userData.role === 'alumni' && !userData.alumniCredibility && AlumniCredibility) {
      userData.alumniCredibility = await AlumniCredibility.findOne({ where: { alumnusId: user.id } });
    }

    return res.json({ user: userData });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({ error: 'Failed to fetch current user' });
  }
};

/**
 * Select role for users (alumni, recruiter, founder)
 */
const selectRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = appConfig.selectableRoles || ['alumni', 'recruiter', 'founder'];

    if (!role || !allowed.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Allowed roles are: ${allowed.join(', ')}`
      });
    }

    let user = req.user ? await User.findByPk(req.user.id) : null;

    // Handle user from session pending state
    if (!user && req.session && req.session.pendingUser) {
      const { googleId, email, name } = req.session.pendingUser;
      user = await User.create({
        googleId,
        email,
        name,
        role,
        isVerified: false,
        optedInReferrals: false
      });
      delete req.session.pendingUser;

      // Log in the user in session
      await new Promise((resolve, reject) => {
        req.login(user, (err) => (err ? reject(err) : resolve()));
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User session not found. Please log in again.' });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    // If alumni, initialize AlumniCredibility if it doesn't exist
    if (role === 'alumni' && AlumniCredibility) {
      const existingCred = await AlumniCredibility.findOne({ where: { alumnusId: user.id } });
      if (!existingCred) {
        await AlumniCredibility.create({
          alumnusId: user.id,
          score: appConfig.initialCredibility || 100
        });
      }
    }

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: user.id,
        action: 'ROLE_SELECTED',
        entityType: 'User',
        entityId: user.id,
        before: { role: previousRole },
        after: { role },
        reason: `User selected role ${role}`,
        createdAt: new Date()
      }).catch(err => console.error('Failed to create audit log for role selection:', err));
    }

    return res.json({
      message: 'Role updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId
      }
    });
  } catch (error) {
    console.error('Error in selectRole:', error);
    return res.status(500).json({ error: 'Failed to update role' });
  }
};

/**
 * Logout current session
 */
const logout = (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      if (req.session) {
        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            console.error('Session destroy error:', destroyErr);
          }
          res.clearCookie('connect.sid');
          return res.json({ message: 'Logged out successfully' });
        });
      } else {
        return res.json({ message: 'Logged out successfully' });
      }
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({ error: 'Failed to logout' });
  }
};

module.exports = {
  getMe,
  selectRole,
  logout
};
