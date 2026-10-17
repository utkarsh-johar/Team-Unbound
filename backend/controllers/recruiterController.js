const { Op } = require('sequelize');
const {
  User,
  Profile,
  Referral,
  ReferralCandidate,
  RecruiterInvite,
  AlumniCredibility,
  CredibilityHistory,
  TechSkillScore,
  Notification,
  AuditLog
} = require('../models');
const appConfig = require('../config/appConfig');

/**
 * List referrals recruiter is invited to
 */
const getReferrals = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    let invitedReferralIds = [];
    if (RecruiterInvite) {
      const invites = await RecruiterInvite.findAll({
        where: { email: userEmail }
      });
      invitedReferralIds = invites.map(i => i.referralId);
    }

    const referrals = await Referral.findAll({
      where: {
        [Op.or]: [
          { recruiterEmail: userEmail },
          { id: { [Op.in]: invitedReferralIds } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    const enrichedReferrals = [];
    for (const ref of referrals) {
      const refData = ref.toJSON ? ref.toJSON() : { ...ref };

      // Include candidates referred for this referral
      if (ReferralCandidate) {
        const referredCandidates = await ReferralCandidate.findAll({
          where: {
            referralId: ref.id,
            status: 'referred'
          }
        });

        const candidatesWithDetails = [];
        for (const cand of referredCandidates) {
          const cData = cand.toJSON ? cand.toJSON() : { ...cand };
          const candidateId = cData.candidateId;

          const candidateUser = await User.findByPk(candidateId, {
            attributes: ['id', 'name', 'email', 'institutionId']
          });

          const candidateProfile = Profile
            ? await Profile.findOne({ where: { userId: candidateId } })
            : null;

          const candidateScores = TechSkillScore
            ? await TechSkillScore.findAll({ where: { userId: candidateId } })
            : [];

          cData.user = candidateUser;
          cData.profile = candidateProfile;
          cData.techScores = candidateScores;
          candidatesWithDetails.push(cData);
        }

        refData.referredCandidates = candidatesWithDetails;
      }

      enrichedReferrals.push(refData);
    }

    return res.json({ referrals: enrichedReferrals });
  } catch (error) {
    console.error('Error in getReferrals:', error);
    return res.status(500).json({ error: 'Failed to retrieve recruiter referrals' });
  }
};

/**
 * Submit outcome for a referral:
 * Allowed outcomes: 'successful', 'failed_screening', 'neutral'
 * Adjusts AlumniCredibility accordingly:
 *  - 'successful': +15
 *  - 'failed_screening': -20
 *  - 'neutral': 0
 */
const submitOutcome = async (req, res) => {
  try {
    const { referralId, outcome, reason } = req.body;
    const allowedOutcomes = ['successful', 'failed_screening', 'neutral'];

    if (!referralId || !outcome || !allowedOutcomes.includes(outcome)) {
      return res.status(400).json({
        error: `Invalid input. referralId and valid outcome (${allowedOutcomes.join(', ')}) are required.`
      });
    }

    const referral = await Referral.findByPk(referralId);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    // Validate recruiter is linked to this referral
    const userEmail = req.user.email.toLowerCase();
    let isLinked = referral.recruiterEmail && referral.recruiterEmail.toLowerCase() === userEmail;

    if (!isLinked && RecruiterInvite) {
      const invite = await RecruiterInvite.findOne({
        where: { referralId, email: userEmail }
      });
      if (invite) isLinked = true;
    }

    if (!isLinked && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to submit an outcome for this referral' });
    }

    if (referral.outcome && referral.outcome !== 'pending') {
      return res.status(400).json({
        error: `Outcome has already been submitted for this referral (${referral.outcome})`
      });
    }

    const previousOutcome = referral.outcome;
    referral.outcome = outcome;
    referral.outcomeReason = reason || `Recruiter confirmed outcome: ${outcome}`;
    await referral.save();

    // Determine credibility adjustment
    const alumnusId = referral.alumnusId;
    let credibilityDelta = 0;
    if (outcome === 'successful') {
      credibilityDelta = appConfig.credibilitySuccess || 15;
    } else if (outcome === 'failed_screening') {
      credibilityDelta = appConfig.credibilityFail || -20;
    }

    let updatedCredibility = null;
    if (AlumniCredibility && alumnusId) {
      let cred = await AlumniCredibility.findOne({
        where: { alumnusId }
      });

      if (!cred) {
        cred = await AlumniCredibility.create({
          alumnusId,
          score: appConfig.initialCredibility || 100
        });
      }

      if (credibilityDelta !== 0) {
        cred.score = Math.max(0, cred.score + credibilityDelta);
        await cred.save();
        updatedCredibility = cred;

        if (CredibilityHistory) {
          await CredibilityHistory.create({
            alumniCredibilityId: cred.id,
            referralId: referral.id,
            change: credibilityDelta,
            reason: referral.outcomeReason
          });
        }
      }
    }

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: req.user.id,
        action: 'REFERRAL_OUTCOME_SUBMITTED',
        entityType: 'Referral',
        entityId: referral.id,
        before: { outcome: previousOutcome },
        after: {
          outcome,
          outcomeReason: referral.outcomeReason,
          credibilityDelta,
          newCredibilityScore: updatedCredibility ? updatedCredibility.score : null
        },
        reason: `Recruiter submitted outcome: ${outcome} for referral ${referral.id}`,
        createdAt: new Date()
      }).catch(err => console.error('Failed to log outcome:', err));
    }

    // Send notification to alumnus
    if (Notification && alumnusId) {
      const deltaMsg = credibilityDelta > 0
        ? `(+${credibilityDelta} credibility points)`
        : credibilityDelta < 0
          ? `(${credibilityDelta} credibility points)`
          : '(no score change)';

      await Notification.create({
        userId: alumnusId,
        type: 'referral_outcome',
        message: `Recruiter confirmed outcome for ${referral.roleTitle} at ${referral.company}: ${outcome} ${deltaMsg}.`,
        referralId: referral.id,
        read: false
      }).catch(err => console.error('Failed to notify alumnus of outcome:', err));
    }

    return res.json({
      message: 'Referral outcome submitted successfully',
      referral: {
        id: referral.id,
        outcome: referral.outcome,
        outcomeReason: referral.outcomeReason
      },
      credibilityDelta,
      newAlumniScore: updatedCredibility ? updatedCredibility.score : null
    });
  } catch (error) {
    console.error('Error in submitOutcome:', error);
    return res.status(500).json({ error: 'Failed to submit referral outcome' });
  }
};

/**
 * Accept invite via token
 */
const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Invite token is required' });
    }

    if (!RecruiterInvite) {
      return res.status(500).json({ error: 'RecruiterInvite service not available' });
    }

    const invite = await RecruiterInvite.findOne({ where: { token } });
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found or invalid' });
    }

    const now = new Date();
    if (invite.expiresAt && new Date(invite.expiresAt) < now) {
      return res.status(410).json({ error: 'This invite has expired' });
    }

    // Find referral details
    const referral = await Referral.findByPk(invite.referralId, {
      attributes: ['id', 'company', 'roleTitle', 'requiredTechnologies', 'description', 'status', 'createdAt']
    });

    let userNeedsSignup = true;
    if (req.user) {
      if (req.user.email.toLowerCase() === invite.email.toLowerCase()) {
        userNeedsSignup = false;
        invite.accepted = true;
        await invite.save();
      }
    } else {
      const existingUser = await User.findOne({ where: { email: invite.email.toLowerCase() } });
      if (existingUser) {
        userNeedsSignup = false;
      }
    }

    return res.json({
      message: 'Invite verified',
      invite: {
        email: invite.email,
        expiresAt: invite.expiresAt,
        accepted: invite.accepted
      },
      referral,
      userNeedsSignup
    });
  } catch (error) {
    console.error('Error in acceptInvite:', error);
    return res.status(500).json({ error: 'Failed to process invite' });
  }
};

module.exports = {
  getReferrals,
  submitOutcome,
  acceptInvite
};
