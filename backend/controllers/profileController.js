const {
  User,
  Profile,
  Institution,
  SkillEvidence,
  TechSkillScore,
  AuditLog
} = require('../models');

/**
 * Get current user's full profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['githubAccessToken'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile = null;
    if (Profile) {
      profile = await Profile.findOne({ where: { userId: user.id } });
    }

    let institution = null;
    if (Institution && user.institutionId) {
      institution = await Institution.findByPk(user.institutionId);
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        optedInReferrals: user.optedInReferrals,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
        institution
      },
      profile
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

/**
 * Update or create profile for current user
 */
const updateProfile = async (req, res) => {
  try {
    const {
      college,
      branchProgram,
      graduationYear,
      cgpa,
      careerIntent,
      summary,
      optedInReferrals
    } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user-level preferences if provided
    if (typeof optedInReferrals === 'boolean') {
      user.optedInReferrals = optedInReferrals;
      await user.save();
    }

    let profile = await Profile.findOne({ where: { userId: user.id } });
    const beforeState = profile ? profile.toJSON() : null;

    const profileData = {
      college: college !== undefined ? college : profile?.college,
      branchProgram: branchProgram !== undefined ? branchProgram : profile?.branchProgram,
      graduationYear: graduationYear !== undefined ? parseInt(graduationYear, 10) : profile?.graduationYear,
      cgpa: cgpa !== undefined ? parseFloat(cgpa) : profile?.cgpa,
      careerIntent: careerIntent !== undefined ? careerIntent : profile?.careerIntent,
      summary: summary !== undefined ? summary : profile?.summary
    };

    if (profile) {
      await profile.update(profileData);
    } else {
      profile = await Profile.create({
        userId: user.id,
        ...profileData
      });
    }

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: user.id,
        action: 'PROFILE_UPDATED',
        entityType: 'Profile',
        entityId: profile.id,
        before: beforeState,
        after: profile.toJSON(),
        reason: 'User updated personal Fit profile details',
        createdAt: new Date()
      }).catch(err => console.error('Failed to log profile update:', err));
    }

    return res.json({
      message: 'Profile updated successfully',
      profile,
      optedInReferrals: user.optedInReferrals
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Get Code-DNA data (skill evidence + scores) with official disclaimers
 */
const getCodeDna = async (req, res) => {
  try {
    const userId = req.user.id;

    const evidence = SkillEvidence
      ? await SkillEvidence.findAll({
          where: { userId },
          order: [['technology', 'ASC']]
        })
      : [];

    const scores = TechSkillScore
      ? await TechSkillScore.findAll({
          where: { userId },
          order: [['score', 'DESC']]
        })
      : [];

    return res.json({
      codeDna: {
        evidence,
        scores
      },
      disclaimer: 'Activity data is evidence for review, not proof of authorship or AI use. CGPA is self-reported and not verified.'
    });
  } catch (error) {
    console.error('Error in getCodeDna:', error);
    return res.status(500).json({ error: 'Failed to retrieve Code-DNA data' });
  }
};

/**
 * Get another user's public profile (limited view: no CGPA, no email)
 */
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'role', 'institutionId']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = Profile
      ? await Profile.findOne({
          where: { userId },
          attributes: ['college', 'branchProgram', 'graduationYear', 'careerIntent', 'summary']
        })
      : null;

    const scores = TechSkillScore
      ? await TechSkillScore.findAll({
          where: { userId },
          attributes: ['technology', 'score', 'computedAt'],
          order: [['score', 'DESC']]
        })
      : [];

    const evidence = SkillEvidence
      ? await SkillEvidence.findAll({
          where: { userId },
          attributes: ['technology', 'evidenceRefs', 'source']
        })
      : [];

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      profile,
      skills: scores,
      evidence,
      disclaimer: 'Activity data is evidence for review, not proof of authorship or AI use.'
    });
  } catch (error) {
    console.error('Error in getPublicProfile:', error);
    return res.status(500).json({ error: 'Failed to retrieve public profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getCodeDna,
  getPublicProfile
};
