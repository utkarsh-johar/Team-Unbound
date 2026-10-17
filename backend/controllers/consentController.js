const {
  User,
  Consent,
  Profile,
  SkillEvidence,
  TechSkillScore,
  Notification,
  AuditLog,
  CooldownState
} = require('../models');

/**
 * Get all consent records for the current user
 */
const getConsents = async (req, res) => {
  try {
    const consents = await Consent.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    return res.json({ consents });
  } catch (error) {
    console.error('Error in getConsents:', error);
    return res.status(500).json({ error: 'Failed to retrieve consents' });
  }
};

/**
 * Grant consent for a given source ('github_public' or 'github_private')
 */
const grantConsent = async (req, res) => {
  try {
    const { source } = req.body;
    const allowedSources = ['github_public', 'github_private'];

    if (!source || !allowedSources.includes(source)) {
      return res.status(400).json({
        error: `Invalid consent source. Allowed values: ${allowedSources.join(', ')}`
      });
    }

    let consent = await Consent.findOne({
      where: {
        userId: req.user.id,
        source
      }
    });

    const now = new Date();
    if (consent) {
      consent.grantedAt = now;
      consent.revokedAt = null;
      await consent.save();
    } else {
      consent = await Consent.create({
        userId: req.user.id,
        source,
        grantedAt: now,
        revokedAt: null
      });
    }

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: req.user.id,
        action: 'CONSENT_GRANTED',
        entityType: 'Consent',
        entityId: consent.id,
        before: null,
        after: { source, grantedAt: now, revokedAt: null },
        reason: `Explicit consent granted for source: ${source}`,
        createdAt: now
      }).catch(err => console.error('Failed to log consent grant:', err));
    }

    // In-app notification
    if (Notification) {
      await Notification.create({
        userId: req.user.id,
        type: 'consent',
        message: `You granted consent for ${source}.`,
        read: false
      }).catch(err => console.error('Failed to notify consent grant:', err));
    }

    return res.json({
      message: `Consent granted for ${source}`,
      consent
    });
  } catch (error) {
    console.error('Error in grantConsent:', error);
    return res.status(500).json({ error: 'Failed to grant consent' });
  }
};

/**
 * Revoke consent for a given source ('github_public' or 'github_private')
 * If revoking github_public, deletes SkillEvidence and TechSkillScore
 */
const revokeConsent = async (req, res) => {
  try {
    const { source } = req.body;
    const allowedSources = ['github_public', 'github_private'];

    if (!source || !allowedSources.includes(source)) {
      return res.status(400).json({
        error: `Invalid consent source. Allowed values: ${allowedSources.join(', ')}`
      });
    }

    const consent = await Consent.findOne({
      where: {
        userId: req.user.id,
        source
      }
    });

    if (!consent) {
      return res.status(404).json({ error: 'Consent record not found for this source' });
    }

    const now = new Date();
    consent.revokedAt = now;
    await consent.save();

    // If revoking github_public, delete associated skill evidence and scores
    let dataDeleted = false;
    if (source === 'github_public') {
      if (SkillEvidence) {
        await SkillEvidence.destroy({ where: { userId: req.user.id } });
      }
      if (TechSkillScore) {
        await TechSkillScore.destroy({ where: { userId: req.user.id } });
      }
      dataDeleted = true;
    }

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: req.user.id,
        action: 'CONSENT_REVOKED',
        entityType: 'Consent',
        entityId: consent.id,
        before: { source, revokedAt: null },
        after: { source, revokedAt: now, associatedDataDeleted: dataDeleted },
        reason: `User revoked consent for ${source}. Skill evidence and scores purged if public data.`,
        createdAt: now
      }).catch(err => console.error('Failed to log consent revoke:', err));
    }

    // In-app notification
    if (Notification) {
      await Notification.create({
        userId: req.user.id,
        type: 'consent',
        message: `You revoked consent for ${source}.${dataDeleted ? ' Derived skill evidence and scores have been deleted.' : ''}`,
        read: false
      }).catch(err => console.error('Failed to notify consent revoke:', err));
    }

    return res.json({
      message: `Consent revoked for ${source}`,
      consent,
      associatedDataDeleted: dataDeleted
    });
  } catch (error) {
    console.error('Error in revokeConsent:', error);
    return res.status(500).json({ error: 'Failed to revoke consent' });
  }
};

/**
 * Delete all user data and anonymize audit logs
 */
const deleteAllData = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // 1. Delete Profile
    if (Profile) {
      await Profile.destroy({ where: { userId } });
    }

    // 2. Delete SkillEvidence & TechSkillScore
    if (SkillEvidence) {
      await SkillEvidence.destroy({ where: { userId } });
    }
    if (TechSkillScore) {
      await TechSkillScore.destroy({ where: { userId } });
    }

    // 3. Delete Cooldown state
    if (CooldownState) {
      await CooldownState.destroy({ where: { candidateId: userId } }).catch(() => {});
    }

    // 4. Delete Notifications
    if (Notification) {
      await Notification.destroy({ where: { userId } });
    }

    // 5. Delete Consent records
    if (Consent) {
      await Consent.destroy({ where: { userId } });
    }

    // 6. Anonymize AuditLog entries (keep audit integrity while stripping PII)
    if (AuditLog) {
      const logs = await AuditLog.findAll({
        where: { actorId: userId }
      });

      for (const log of logs) {
        log.actorId = null;
        if (log.before && typeof log.before === 'object') {
          const stripped = { ...log.before };
          delete stripped.email;
          delete stripped.name;
          delete stripped.githubAccessToken;
          delete stripped.googleId;
          delete stripped.githubId;
          log.before = stripped;
        }
        if (log.after && typeof log.after === 'object') {
          const stripped = { ...log.after };
          delete stripped.email;
          delete stripped.name;
          delete stripped.githubAccessToken;
          delete stripped.googleId;
          delete stripped.githubId;
          log.after = stripped;
        }
        log.reason = `[ANONYMIZED] ${log.reason || ''}`;
        await log.save();
      }

      // Record final audit entry
      await AuditLog.create({
        actorId: null,
        action: 'USER_DATA_DELETED',
        entityType: 'User',
        entityId: userId,
        before: null,
        after: { anonymized: true },
        reason: 'User requested complete deletion of all personal data under consent policy',
        createdAt: now
      }).catch(err => console.error('Failed to log deletion:', err));
    }

    // 7. Delete the User record
    await User.destroy({ where: { id: userId } });

    // 8. Clear session
    if (req.session) {
      req.session.destroy(() => {});
    }
    res.clearCookie('connect.sid');

    return res.json({
      message: 'All personal data has been deleted and audit logs anonymized successfully.'
    });
  } catch (error) {
    console.error('Error in deleteAllData:', error);
    return res.status(500).json({ error: 'Failed to delete user data' });
  }
};

module.exports = {
  getConsents,
  grantConsent,
  revokeConsent,
  deleteAllData
};
