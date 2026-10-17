const { Op } = require('sequelize');
const {
  User,
  Profile,
  Referral,
  ReferralCandidate,
  AlumniCredibility,
  CredibilityHistory,
  AuditLog
} = require('../models');
const appConfig = require('../config/appConfig');

/**
 * Get alumni dashboard data:
 * - referrals posted (with status, expiry, slots, outcomes)
 * - ranked top five per referral with component scores
 * - credibility score with change history (reasons shown)
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch alumnus's referrals
    const referrals = await Referral.findAll({
      where: {
        alumnusId: userId
      },
      order: [['createdAt', 'DESC']]
    });

    const enrichedReferrals = [];
    for (const ref of referrals) {
      const refData = ref.toJSON ? ref.toJSON() : { ...ref };

      if (ReferralCandidate) {
        const topCandidates = await ReferralCandidate.findAll({
          where: {
            referralId: ref.id,
            rank: { [Op.ne]: null }
          },
          order: [['rank', 'ASC']],
          limit: 5
        });

        const candidatesWithDetails = [];
        for (const cand of topCandidates) {
          const cData = cand.toJSON ? cand.toJSON() : { ...cand };
          const candidateId = cData.candidateId;

          const candidateUser = await User.findByPk(candidateId, {
            attributes: ['id', 'name', 'institutionId']
          });

          const candidateProfile = Profile
            ? await Profile.findOne({
                where: { userId: candidateId },
                attributes: ['college', 'branchProgram', 'graduationYear', 'careerIntent']
              })
            : null;

          cData.user = candidateUser;
          cData.profile = candidateProfile;
          candidatesWithDetails.push(cData);
        }

        refData.candidates = candidatesWithDetails;
        refData.rankedCandidates = candidatesWithDetails;
        const selectedCount = candidatesWithDetails.filter(
          (c) => c.status === 'referred' || c.status === 'selected'
        ).length;
        refData.slotsRemaining = Math.max(0, refData.slots - selectedCount);
      }

      enrichedReferrals.push(refData);
    }

    // 2. Fetch credibility and history
    let credibility = null;
    let history = [];

    if (AlumniCredibility) {
      credibility = await AlumniCredibility.findOne({
        where: { alumnusId: userId }
      });

      if (!credibility) {
        credibility = await AlumniCredibility.create({
          alumnusId: userId,
          score: appConfig.initialCredibility || 100
        });
      }

      if (CredibilityHistory) {
        history = await CredibilityHistory.findAll({
          where: { alumniCredibilityId: credibility.id },
          order: [['createdAt', 'DESC']]
        });
      }
    }

    return res.json({
      referrals: enrichedReferrals,
      credibility: {
        score: credibility ? credibility.score : 100,
        history
      },
      isVerified: req.user.isVerified
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    return res.status(500).json({ error: 'Failed to retrieve alumni dashboard' });
  }
};

/**
 * Get credibility score with change history and reasons
 */
const getCredibility = async (req, res) => {
  try {
    const userId = req.user.id;

    let credibility = null;
    let history = [];

    if (AlumniCredibility) {
      credibility = await AlumniCredibility.findOne({
        where: { alumnusId: userId }
      });

      if (!credibility) {
        credibility = await AlumniCredibility.create({
          alumnusId: userId,
          score: appConfig.initialCredibility || 100
        });
      }

      if (CredibilityHistory) {
        history = await CredibilityHistory.findAll({
          where: { alumniCredibilityId: credibility.id },
          order: [['createdAt', 'DESC']]
        });
      }
    }

    return res.json({
      credibility: {
        score: credibility ? credibility.score : 100,
        history
      }
    });
  } catch (error) {
    console.error('Error in getCredibility:', error);
    return res.status(500).json({ error: 'Failed to retrieve credibility score' });
  }
};

/**
 * Submit verification request for alumni
 */
const submitVerification = async (req, res) => {
  try {
    const { proofUrl, proofType, notes } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set isVerified to false (pending admin review)
    user.isVerified = false;
    await user.save();

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: user.id,
        action: 'ALUMNI_VERIFICATION_REQUESTED',
        entityType: 'User',
        entityId: user.id,
        before: { isVerified: user.isVerified },
        after: { isVerified: false, pendingReview: true, proofType, proofUrl, notes },
        reason: 'Alumnus submitted documentation for verification',
        createdAt: new Date()
      }).catch(err => console.error('Failed to log verification request:', err));
    }

    return res.json({
      message: 'Verification request submitted successfully. It will be reviewed by an administrator.',
      isVerified: false,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error in submitVerification:', error);
    return res.status(500).json({ error: 'Failed to submit verification request' });
  }
};

module.exports = {
  getDashboard,
  getCredibility,
  submitVerification
};
