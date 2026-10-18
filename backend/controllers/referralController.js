const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const {
  Referral,
  ReferralCandidate,
  RecruiterInvite,
  CooldownState,
  User,
  Profile,
  Institution,
  Consent,
  TechSkillScore,
  Notification,
  AuditLog
} = require('../models');
const appConfig = require('../config/appConfig');

/**
 * Match candidates for a flash referral using fairness gate & weighted scoring formula:
 * Match = (0.45 * CodeDNA) + (0.35 * Sandbox) + (0.20 * Fit)
 */
const matchCandidates = async (referral) => {
  const institutionFilter = referral.openToOtherColleges
    ? {}
    : { institutionId: referral.institutionId };

  // 1. Find all eligible students
  const students = await User.findAll({
    where: {
      role: 'student',
      optedInReferrals: true,
      institutionId: { [Op.ne]: null },
      ...institutionFilter
    },
    include: [
      ...(Profile ? [{ model: Profile, as: 'profile', required: false }] : []),
      ...(Consent ? [{ model: Consent, as: 'consents', required: false }] : []),
      ...(TechSkillScore ? [{ model: TechSkillScore, as: 'techSkillScores', required: false }] : [])
    ]
  });

  const now = new Date();
  const passingCandidates = [];
  const skippedCandidates = [];

  const requiredTechs = Array.isArray(referral.requiredTechnologies)
    ? referral.requiredTechnologies.map(t => t.trim().toLowerCase())
    : (referral.requiredTechnologies || '').split(',').map(t => t.trim().toLowerCase());

  for (const student of students) {
    const studentData = student.toJSON ? student.toJSON() : student;
    const profile = studentData.profile || studentData.Profile;
    const consents = studentData.consents || studentData.Consents || [];
    const techScores = studentData.techSkillScores || studentData.TechSkillScores || [];

    // Check active github_public consent
    const hasPublicConsent = consents.some(
      c => c.source === 'github_public' && (!c.revokedAt || new Date(c.revokedAt) > now)
    );

    if (!hasPublicConsent) {
      skippedCandidates.push({
        candidateId: student.id,
        skippedReason: 'missing_github_consent',
        student: studentData
      });
      continue;
    }

    // Check required profile fields completed
    if (!profile || !profile.college || !profile.branchProgram || !profile.graduationYear || !profile.careerIntent) {
      skippedCandidates.push({
        candidateId: student.id,
        skippedReason: 'incomplete_profile',
        student: studentData
      });
      continue;
    }

    // Check CooldownState
    let cooldown = null;
    if (CooldownState) {
      cooldown = await CooldownState.findOne({
        where: { candidateId: student.id }
      });
    }

    if (cooldown && cooldown.cooldownUntil && new Date(cooldown.cooldownUntil) > now) {
      skippedCandidates.push({
        candidateId: student.id,
        skippedReason: 'cooldown',
        student: studentData
      });
      continue;
    }

    // Candidate passed fairness gate! Now compute scores.
    // 1. CodeDNA score: Average of TechSkillScores matching required technologies
    let codeDnaScore = 0;
    if (requiredTechs.length > 0 && techScores.length > 0) {
      const matchingScores = techScores.filter(s =>
        requiredTechs.some(rt => s.technology && s.technology.toLowerCase() === rt)
      );
      if (matchingScores.length > 0) {
        const sum = matchingScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
        codeDnaScore = Math.round(sum / matchingScores.length);
      }
    }

    // 2. Sandbox score: Phase 1 fixed placeholder (50)
    const sandboxScore = appConfig.sandboxPlaceholder || 50;

    // 3. Fit score from Profile fields (0-100)
    let fitScore = 0;
    const currentYear = now.getFullYear();
    const gradYear = parseInt(profile.graduationYear, 10);
    if (!isNaN(gradYear) && gradYear >= currentYear && gradYear <= currentYear + 2) {
      fitScore += 40;
    } else if (!isNaN(gradYear)) {
      fitScore += 20;
    }

    if (profile.branchProgram && profile.branchProgram.trim().length > 0) {
      fitScore += 30;
    }

    if (profile.careerIntent) {
      fitScore += 30;
    }
    fitScore = Math.min(100, fitScore);

    // Weighted Match Score formula
    const weights = appConfig.weights || { codeDna: 0.45, sandbox: 0.35, fit: 0.20 };
    const matchScore = Math.round(
      (weights.codeDna * codeDnaScore) +
      (weights.sandbox * sandboxScore) +
      (weights.fit * fitScore)
    );

    passingCandidates.push({
      candidateId: student.id,
      codeDnaScore,
      sandboxScore,
      fitScore,
      matchScore,
      student: studentData
    });
  }

  // Sort passing candidates by matchScore descending, then codeDnaScore
  passingCandidates.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.codeDnaScore - a.codeDnaScore;
  });

  // Top 5 become ranked candidates; remainder are recorded with skippedReason 'outside_top_5'
  const top5 = passingCandidates.slice(0, 5).map((cand, idx) => ({
    ...cand,
    rank: idx + 1
  }));

  const outsideTop5 = passingCandidates.slice(5).map(cand => ({
    ...cand,
    rank: null,
    skippedReason: 'outside_top_5'
  }));

  // Clear existing referral candidates for this referral if re-matching
  if (ReferralCandidate) {
    await ReferralCandidate.destroy({ where: { referralId: referral.id } });

    // Store Top 5 ranked candidates
    for (const cand of top5) {
      await ReferralCandidate.create({
        referralId: referral.id,
        candidateId: cand.candidateId,
        rank: cand.rank,
        matchScore: cand.matchScore,
        codeDnaScore: cand.codeDnaScore,
        sandboxScore: cand.sandboxScore,
        fitScore: cand.fitScore,
        status: 'ranked'
      });
    }

    // Store skipped candidates for audit & fairness inspection
    const allSkipped = [...skippedCandidates, ...outsideTop5];
    for (const cand of allSkipped) {
      await ReferralCandidate.create({
        referralId: referral.id,
        candidateId: cand.candidateId,
        rank: null,
        matchScore: cand.matchScore || 0,
        codeDnaScore: cand.codeDnaScore || 0,
        sandboxScore: cand.sandboxScore || 0,
        fitScore: cand.fitScore || 0,
        skippedReason: cand.skippedReason,
        status: 'rejected'
      });
    }
  }

  // Audit log for candidate ranking
  if (AuditLog) {
    await AuditLog.create({
      actorId: referral.alumnusId,
      action: 'CANDIDATES_MATCHED',
      entityType: 'Referral',
      entityId: referral.id,
      before: null,
      after: {
        rankedCount: top5.length,
        skippedCount: skippedCandidates.length + outsideTop5.length,
        weights: appConfig.weights
      },
      reason: 'Applied fairness gate and weighted match formula (0.45 CodeDNA + 0.35 Sandbox + 0.20 Fit)',
      createdAt: now
    }).catch(err => console.error('Failed to log matching:', err));
  }

  return {
    top5,
    skipped: [...skippedCandidates, ...outsideTop5]
  };
};

/**
 * List referrals based on user role
 */
const listReferrals = async (req, res) => {
  try {
    const role = req.user.role;
    const now = new Date();

    if (role === 'alumni') {
      const referrals = await Referral.findAll({
        where: {
          alumnusId: req.user.id
        },
        order: [['createdAt', 'DESC']]
      });

      const enhanced = [];
      for (const ref of referrals) {
        const item = ref.toJSON ? ref.toJSON() : { ...ref };
        if (ReferralCandidate) {
          item.candidates = await ReferralCandidate.findAll({
            where: {
              referralId: ref.id,
              rank: { [Op.ne]: null }
            },
            order: [['rank', 'ASC']]
          });
        }
        enhanced.push(item);
      }

      return res.json({ referrals: enhanced });
    }

    if (role === 'student') {
      const whereCondition = {
        status: 'open',
        expiresAt: { [Op.gt]: now },
        slots: { [Op.gt]: 0 }
      };

      if (req.user.institutionId) {
        whereCondition[Op.or] = [
          { institutionId: req.user.institutionId },
          { openToOtherColleges: true }
        ];
      } else {
        whereCondition.openToOtherColleges = true;
      }

      const referrals = await Referral.findAll({
        where: whereCondition,
        attributes: [
          'id',
          'company',
          'roleTitle',
          'requiredTechnologies',
          'slots',
          'description',
          'expiresAt',
          'status',
          'openToOtherColleges',
          'createdAt'
        ],
        order: [['createdAt', 'DESC']]
      });

      const result = [];
      for (const ref of referrals) {
        const item = ref.toJSON ? ref.toJSON() : { ...ref };
        if (ReferralCandidate) {
          const myEntry = await ReferralCandidate.findOne({
            where: {
              referralId: ref.id,
              candidateId: req.user.id
            }
          });
          item.myStatus = myEntry ? myEntry.status : 'not_matched';
          if (myEntry && myEntry.status === 'referred') {
            item.selected = true;
          }
        }
        result.push(item);
      }

      return res.json({ referrals: result });
    }

    if (role === 'recruiter') {
      let invitedReferralIds = [];
      if (RecruiterInvite) {
        const invites = await RecruiterInvite.findAll({
          where: { email: req.user.email.toLowerCase() }
        });
        invitedReferralIds = invites.map(i => i.referralId);
      }

      const referrals = await Referral.findAll({
        where: {
          [Op.or]: [
            { recruiterEmail: req.user.email.toLowerCase() },
            { id: { [Op.in]: invitedReferralIds } }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      return res.json({ referrals });
    }

    // Admin sees all
    const allReferrals = await Referral.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.json({ referrals: allReferrals });
  } catch (error) {
    console.error('Error in listReferrals:', error);
    return res.status(500).json({ error: 'Failed to list referrals' });
  }
};

/**
 * Create a new flash referral (Alumni only)
 */
const createReferral = async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can post referrals' });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        error: 'Your alumni profile is pending verification by an administrator. You cannot post referrals yet.'
      });
    }

    const {
      company,
      roleTitle,
      requiredTechnologies,
      slots,
      description,
      openToOtherColleges,
      recruiterEmail
    } = req.body;

    if (!company || !roleTitle || !requiredTechnologies || !slots || !description) {
      return res.status(400).json({
        error: 'Missing required fields: company, roleTitle, requiredTechnologies, slots, description are mandatory'
      });
    }

    const parsedSlots = parseInt(slots, 10);
    if (isNaN(parsedSlots) || parsedSlots < 1) {
      return res.status(400).json({ error: 'Slots must be a positive number' });
    }

    const expiryDays = appConfig.referralExpiryDays || 7;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const techArray = Array.isArray(requiredTechnologies)
      ? requiredTechnologies
      : requiredTechnologies.split(',').map(t => t.trim());

    const referral = await Referral.create({
      alumnusId: req.user.id,
      institutionId: req.user.institutionId,
      company: company.trim(),
      roleTitle: roleTitle.trim(),
      requiredTechnologies: techArray,
      slots: parsedSlots,
      description: description.trim(),
      expiresAt,
      status: 'open',
      openToOtherColleges: !!openToOtherColleges,
      recruiterEmail: recruiterEmail ? recruiterEmail.trim() : null
    });

    // Run matching engine
    const matchResult = await matchCandidates(referral);

    // If recruiterEmail provided, create invite
    let invite = null;
    let inviteLink = null;
    if (recruiterEmail && RecruiterInvite) {
      const inviteToken = uuidv4();
      const inviteExpiryDays = appConfig.inviteExpiryDays || 7;
      invite = await RecruiterInvite.create({
        referralId: referral.id,
        email: recruiterEmail.trim().toLowerCase(),
        token: inviteToken,
        expiresAt: new Date(Date.now() + inviteExpiryDays * 24 * 60 * 60 * 1000),
        accepted: false
      });
      inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recruiter/invite/${inviteToken}`;
    }

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: req.user.id,
        action: 'REFERRAL_CREATED',
        entityType: 'Referral',
        entityId: referral.id,
        before: null,
        after: referral.toJSON(),
        reason: `Alumnus posted flash referral for ${roleTitle} at ${company}`,
        createdAt: new Date()
      }).catch(err => console.error('Failed to log referral creation:', err));
    }

    // Send notifications to ranked top 5 candidates
    if (Notification && matchResult.top5) {
      for (const cand of matchResult.top5) {
        await Notification.create({
          userId: cand.candidateId,
          type: 'referral_match',
          message: `A new referral for ${roleTitle} at ${company} matches your Code-DNA skills!`,
          referralId: referral.id,
          read: false
        }).catch(err => console.error('Failed to send match notification:', err));
      }
    }

    return res.status(201).json({
      message: 'Referral created successfully and candidate matching completed',
      referral,
      topCandidatesCount: matchResult.top5.length,
      inviteLink
    });
  } catch (error) {
    console.error('Error in createReferral:', error);
    return res.status(500).json({ error: 'Failed to create referral' });
  }
};

/**
 * Get referral detail with candidate breakdown (Alumni only for ranked list)
 */
const getReferralDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const referral = await Referral.findByPk(id, {
      include: [
        { model: User, as: 'alumnus', attributes: ['id', 'name', 'email'] },
        { model: Institution, as: 'institution', attributes: ['id', 'name'] }
      ]
    });

    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const refData = referral.toJSON ? referral.toJSON() : { ...referral };

    // Normalize requiredTechnologies
    if (typeof refData.requiredTechnologies === 'string') {
      try {
        refData.requiredTechnologies = JSON.parse(refData.requiredTechnologies);
      } catch (e) {
        refData.requiredTechnologies = refData.requiredTechnologies.split(',').map((s) => s.trim());
      }
    }
    if (!Array.isArray(refData.requiredTechnologies)) {
      refData.requiredTechnologies = [];
    }

    // Compute slots remaining
    let selectedCount = 0;
    if (ReferralCandidate) {
      selectedCount = await ReferralCandidate.count({
        where: {
          referralId: referral.id,
          status: { [Op.in]: ['referred', 'selected'] }
        }
      });
    }
    refData.slotsRemaining = Math.max(0, (refData.slots || 1) - selectedCount);

    const isOwner = refData.alumnusId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (isOwner || isAdmin) {
      let candidates = [];
      if (ReferralCandidate) {
        candidates = await ReferralCandidate.findAll({
          where: {
            referralId: referral.id,
            rank: { [Op.ne]: null }
          },
          order: [['rank', 'ASC']]
        });

        const enriched = [];
        for (const cand of candidates) {
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
          enriched.push(cData);
        }
        refData.candidates = enriched;
      }

      if (RecruiterInvite) {
        const invite = await RecruiterInvite.findOne({ where: { referralId: referral.id } });
        if (invite) {
          refData.recruiterInvite = {
            id: invite.id,
            token: invite.token,
            email: invite.email,
            accepted: invite.accepted,
            expiresAt: invite.expiresAt,
            inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recruiter/invite/${invite.token}`
          };
        }
      }

      return res.json({ referral: refData });
    }

    if (req.user.role === 'student') {
      // Find candidate's own standing if exists
      if (ReferralCandidate) {
        const myEntry = await ReferralCandidate.findOne({
          where: {
            referralId: referral.id,
            candidateId: req.user.id
          }
        });
        if (myEntry) {
          refData.myMatch = {
            rank: myEntry.rank,
            matchScore: myEntry.matchScore,
            status: myEntry.status,
            codeDnaScore: myEntry.codeDnaScore,
            sandboxScore: myEntry.sandboxScore,
            fitScore: myEntry.fitScore
          };
        }
      }
      delete refData.candidates;
      delete refData.recruiterEmail;
      return res.json({ referral: refData });
    }

    return res.json({ referral: refData });
  } catch (error) {
    console.error('Error in getReferralDetail:', error);
    return res.status(500).json({ error: 'Failed to retrieve referral detail' });
  }
};

/**
 * Alumni selects candidate from ranked list
 */
const selectCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }

    const referral = await Referral.findByPk(id);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const isOwner = referral.alumnusId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to select candidates for this referral' });
    }

    if (referral.slots <= 0 || referral.status !== 'open') {
      return res.status(400).json({ error: 'No available slots or referral is closed' });
    }

    const candidateEntry = await ReferralCandidate.findOne({
      where: {
        referralId: id,
        candidateId
      }
    });

    if (!candidateEntry) {
      return res.status(404).json({ error: 'Candidate not found in referral shortlist' });
    }

    // Mark selected candidate as referred
    candidateEntry.status = 'referred';
    await candidateEntry.save();

    // Mark remaining candidates as rejected
    await ReferralCandidate.update(
      { status: 'rejected' },
      {
        where: {
          referralId: id,
          candidateId: { [Op.ne]: candidateId },
          status: 'ranked'
        }
      }
    );

    // Decrement slots and update referral status
    referral.slots -= 1;
    if (referral.slots <= 0) {
      referral.status = 'closed';
    }
    await referral.save();

    // Update CooldownState for referred candidate
    if (CooldownState) {
      let cooldown = await CooldownState.findOne({
        where: { candidateId }
      });

      const triggerCount = appConfig.cooldownTriggerCount || 2;
      const cooldownDays = appConfig.cooldownDays || 7;

      if (!cooldown) {
        cooldown = await CooldownState.create({
          candidateId,
          referralCount: 1,
          cooldownUntil: null
        });
      } else {
        cooldown.referralCount = (cooldown.referralCount || 0) + 1;
        if (cooldown.referralCount >= triggerCount) {
          cooldown.cooldownUntil = new Date(Date.now() + cooldownDays * 24 * 60 * 60 * 1000);
        }
        await cooldown.save();
      }
    }

    // Create Audit Log
    if (AuditLog) {
      await AuditLog.create({
        actorId: req.user.id,
        action: 'CANDIDATE_SELECTED',
        entityType: 'ReferralCandidate',
        entityId: candidateEntry.id,
        before: { status: 'ranked' },
        after: { status: 'referred', remainingSlots: referral.slots },
        reason: `Alumnus confirmed referral for candidate ID ${candidateId}`,
        createdAt: new Date()
      }).catch(err => console.error('Failed to log candidate selection:', err));
    }

    // Send Notifications
    if (Notification) {
      await Notification.create({
        userId: candidateId,
        type: 'referral_selected',
        message: `Congratulations! You have been referred for ${referral.roleTitle} at ${referral.company}.`,
        referralId: referral.id,
        read: false
      }).catch(err => console.error('Failed to notify candidate:', err));

      await Notification.create({
        userId: req.user.id,
        type: 'referral_confirmed',
        message: `You successfully referred a candidate for ${referral.roleTitle} at ${referral.company}.`,
        referralId: referral.id,
        read: false
      }).catch(err => console.error('Failed to notify alumni:', err));
    }

    return res.json({
      message: 'Candidate selected successfully for referral',
      candidateEntry,
      remainingSlots: referral.slots,
      referralStatus: referral.status
    });
  } catch (error) {
    console.error('Error in selectCandidate:', error);
    return res.status(500).json({ error: 'Failed to select candidate' });
  }
};

/**
 * Generate recruiter invite link
 */
const generateInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const referral = await Referral.findByPk(id);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const isOwner = referral.alumnusId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to generate invite for this referral' });
    }

    const targetEmail = (email || referral.recruiterEmail || '').trim().toLowerCase();
    if (!targetEmail) {
      return res.status(400).json({ error: 'Recruiter email is required' });
    }

    const token = uuidv4();
    const expiryDays = appConfig.inviteExpiryDays || 7;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    let invite = null;
    if (RecruiterInvite) {
      invite = await RecruiterInvite.create({
        referralId: referral.id,
        email: targetEmail,
        token,
        expiresAt,
        accepted: false
      });
    }

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recruiter/invite/${token}`;

    if (AuditLog) {
      await AuditLog.create({
        actorId: req.user.id,
        action: 'RECRUITER_INVITE_GENERATED',
        entityType: 'RecruiterInvite',
        entityId: invite ? invite.id : null,
        before: null,
        after: { referralId: referral.id, email: targetEmail, expiresAt },
        reason: `Generated recruiter invite link for ${targetEmail}`,
        createdAt: new Date()
      }).catch(err => console.error('Failed to log invite:', err));
    }

    return res.json({
      message: 'Recruiter invite link generated successfully',
      invite,
      inviteLink
    });
  } catch (error) {
    console.error('Error in generateInvite:', error);
    return res.status(500).json({ error: 'Failed to generate invite' });
  }
};

module.exports = {
  listReferrals,
  createReferral,
  getReferralDetail,
  selectCandidate,
  generateInvite,
  matchCandidates
};
