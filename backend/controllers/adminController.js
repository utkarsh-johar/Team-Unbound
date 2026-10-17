const { Op } = require('sequelize');
const {
  User,
  Institution,
  AlumniCredibility,
  CredibilityHistory,
  Appeal,
  AuditLog,
  Notification
} = require('../models');
const appConfig = require('../config/appConfig');

/**
 * List alumni pending verification
 */
const getPendingAlumni = async (req, res) => {
  try {
    const pendingAlumni = await User.findAll({
      where: {
        role: 'alumni',
        isVerified: false
      },
      attributes: ['id', 'name', 'email', 'institutionId', 'createdAt', 'isVerified'],
      include: Institution ? [{ model: Institution, as: 'institution', required: false }] : [],
      order: [['createdAt', 'ASC']]
    });

    return res.json({ pendingAlumni });
  } catch (error) {
    console.error('Error in getPendingAlumni:', error);
    return res.status(500).json({ error: 'Failed to retrieve pending alumni' });
  }
};

/**
 * Approve or reject alumni verification
 */
const verifyAlumni = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approved, reason } = req.body;

    if (approved === undefined || !reason || !reason.trim()) {
      return res.status(400).json({
        error: 'Approved status (boolean) and a non-empty reason are required for verification audit.'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'alumni') {
      return res.status(400).json({ error: 'User does not have alumni role' });
    }

    const previousVerified = user.isVerified;
    user.isVerified = !!approved;
    await user.save();

    // If approved, make sure AlumniCredibility record exists
    if (user.isVerified && AlumniCredibility) {
      const existingCred = await AlumniCredibility.findOne({
        where: { alumnusId: user.id }
      });
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
        actorId: req.user.id,
        action: approved ? 'ALUMNI_VERIFIED' : 'ALUMNI_REJECTED',
        entityType: 'User',
        entityId: user.id,
        before: { isVerified: previousVerified },
        after: { isVerified: user.isVerified },
        reason: reason.trim(),
        createdAt: new Date()
      }).catch(err => console.error('Failed to log alumni verification:', err));
    }

    // Send Notification
    if (Notification) {
      await Notification.create({
        userId: user.id,
        type: 'verification_decision',
        message: approved
          ? 'Your alumni account has been approved and verified! You can now post flash referrals.'
          : `Your alumni verification was not approved. Reason: ${reason.trim()}`,
        read: false
      }).catch(err => console.error('Failed to notify user of verification:', err));
    }

    return res.json({
      message: `Alumni verification ${approved ? 'approved' : 'rejected'} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in verifyAlumni:', error);
    return res.status(500).json({ error: 'Failed to process verification decision' });
  }
};

/**
 * List pending appeals
 */
const getAppeals = async (req, res) => {
  try {
    if (!Appeal) {
      return res.json({ appeals: [] });
    }

    const appeals = await Appeal.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'ASC']]
    });

    const enrichedAppeals = [];
    for (const app of appeals) {
      const aData = app.toJSON ? app.toJSON() : { ...app };
      const submitter = await User.findByPk(aData.submittedBy, {
        attributes: ['id', 'name', 'email', 'role']
      });
      aData.submitter = submitter;
      enrichedAppeals.push(aData);
    }

    return res.json({ appeals: enrichedAppeals });
  } catch (error) {
    console.error('Error in getAppeals:', error);
    return res.status(500).json({ error: 'Failed to retrieve appeals' });
  }
};

/**
 * Decide an appeal (upheld or reversed)
 * If reversed and entityType='credibility_change', restore credibility points.
 */
const decideAppeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, adminReason } = req.body;
    const validDecisions = ['upheld', 'reversed'];

    if (!decision || !validDecisions.includes(decision) || !adminReason || !adminReason.trim()) {
      return res.status(400).json({
        error: `Decision must be 'upheld' or 'reversed', and a non-empty adminReason is required.`
      });
    }

    if (!Appeal) {
      return res.status(500).json({ error: 'Appeal model not available' });
    }

    const appeal = await Appeal.findByPk(id);
    if (!appeal) {
      return res.status(404).json({ error: 'Appeal not found' });
    }

    if (appeal.status !== 'pending') {
      return res.status(400).json({
        error: `Appeal has already been decided with status: ${appeal.status}`
      });
    }

    const previousStatus = appeal.status;
    appeal.status = decision;
    appeal.adminReason = adminReason.trim();
    appeal.reviewedAt = new Date();
    await appeal.save();

    let pointsRestored = 0;
    let newScore = null;

    // If appeal is reversed and relates to credibility change, restore points
    if (decision === 'reversed' && (appeal.entityType === 'credibility_change' || appeal.entityType === 'CredibilityHistory' || appeal.entityType === 'Referral')) {
      const submitterId = appeal.submittedBy;
      if (AlumniCredibility && submitterId) {
        let cred = await AlumniCredibility.findOne({
          where: { alumnusId: submitterId }
        });

        if (cred) {
          pointsRestored = Math.abs(appConfig.credibilityFail || 20);
          cred.score += pointsRestored;
          await cred.save();
          newScore = cred.score;

          if (CredibilityHistory) {
            await CredibilityHistory.create({
              alumniCredibilityId: cred.id,
              change: pointsRestored,
              reason: `Appeal approved and reversed: ${adminReason.trim()}`
            });
          }
        }
      }
    }

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: req.user.id,
        action: 'APPEAL_DECIDED',
        entityType: 'Appeal',
        entityId: appeal.id,
        before: { status: previousStatus },
        after: {
          status: decision,
          adminReason: adminReason.trim(),
          pointsRestored,
          newScore
        },
        reason: `Admin decided appeal (${decision}): ${adminReason.trim()}`,
        createdAt: new Date()
      }).catch(err => console.error('Failed to log appeal decision:', err));
    }

    // Send Notification to appeal submitter
    if (Notification && appeal.submittedBy) {
      const decisionMsg = decision === 'reversed'
        ? `Your appeal was APPROVED. ${pointsRestored > 0 ? `+${pointsRestored} credibility points have been restored.` : ''} Admin note: ${adminReason.trim()}`
        : `Your appeal was UPHELD (penalty maintained). Admin note: ${adminReason.trim()}`;

      await Notification.create({
        userId: appeal.submittedBy,
        type: 'appeal_decision',
        message: decisionMsg,
        read: false
      }).catch(err => console.error('Failed to notify submitter:', err));
    }

    return res.json({
      message: `Appeal has been marked as ${decision}`,
      appeal,
      pointsRestored,
      newScore
    });
  } catch (error) {
    console.error('Error in decideAppeal:', error);
    return res.status(500).json({ error: 'Failed to decide appeal' });
  }
};

/**
 * List audit logs with pagination and filters
 */
const getAuditLogs = async (req, res) => {
  try {
    if (!AuditLog) {
      return res.json({ total: 0, logs: [], page: 1, totalPages: 0 });
    }

    const {
      page = 1,
      limit = 50,
      entityType,
      action,
      actorId,
      startDate,
      endDate
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
      logs: rows
    });
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    return res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
};

module.exports = {
  getPendingAlumni,
  verifyAlumni,
  getAppeals,
  decideAppeal,
  getAuditLogs
};
