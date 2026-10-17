const sequelize = require('../config/database');

// Import model definition functions
const defineInstitution = require('./Institution');
const defineUser = require('./User');
const defineConsent = require('./Consent');
const defineProfile = require('./Profile');
const defineSkillEvidence = require('./SkillEvidence');
const defineTechSkillScore = require('./TechSkillScore');
const defineReferral = require('./Referral');
const defineReferralCandidate = require('./ReferralCandidate');
const defineCooldownState = require('./CooldownState');
const defineAlumniCredibility = require('./AlumniCredibility');
const defineCredibilityHistory = require('./CredibilityHistory');
const defineAuditLog = require('./AuditLog');
const defineAppeal = require('./Appeal');
const defineRecruiterInvite = require('./RecruiterInvite');
const defineNotification = require('./Notification');

// Initialize models
const Institution = defineInstitution(sequelize);
const User = defineUser(sequelize);
const Consent = defineConsent(sequelize);
const Profile = defineProfile(sequelize);
const SkillEvidence = defineSkillEvidence(sequelize);
const TechSkillScore = defineTechSkillScore(sequelize);
const Referral = defineReferral(sequelize);
const ReferralCandidate = defineReferralCandidate(sequelize);
const CooldownState = defineCooldownState(sequelize);
const AlumniCredibility = defineAlumniCredibility(sequelize);
const CredibilityHistory = defineCredibilityHistory(sequelize);
const AuditLog = defineAuditLog(sequelize);
const Appeal = defineAppeal(sequelize);
const RecruiterInvite = defineRecruiterInvite(sequelize);
const Notification = defineNotification(sequelize);

// Set up associations

// User belongsTo Institution & Institution hasMany User
User.belongsTo(Institution, { foreignKey: 'institutionId', as: 'institution' });
Institution.hasMany(User, { foreignKey: 'institutionId', as: 'users' });

// User hasMany Consent & Consent belongsTo User
User.hasMany(Consent, { foreignKey: 'userId', as: 'consents' });
Consent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User hasOne Profile & Profile belongsTo User
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User hasMany SkillEvidence & SkillEvidence belongsTo User
User.hasMany(SkillEvidence, { foreignKey: 'userId', as: 'skillEvidences' });
SkillEvidence.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User hasMany TechSkillScore & TechSkillScore belongsTo User
User.hasMany(TechSkillScore, { foreignKey: 'userId', as: 'techSkillScores' });
TechSkillScore.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User hasMany Referral (as alumnus) & Referral belongsTo User (as alumnus)
User.hasMany(Referral, { foreignKey: 'alumnusId', as: 'referrals' });
User.hasMany(Referral, { foreignKey: 'alumnusId', as: 'alumnusReferrals' });
Referral.belongsTo(User, { foreignKey: 'alumnusId', as: 'alumnus' });

// User hasMany ReferralCandidate (as candidate) & ReferralCandidate belongsTo User (as candidate)
User.hasMany(ReferralCandidate, { foreignKey: 'candidateId', as: 'referralCandidates' });
ReferralCandidate.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

// Referral belongsTo Institution & Institution hasMany Referral
Referral.belongsTo(Institution, { foreignKey: 'institutionId', as: 'institution' });
Institution.hasMany(Referral, { foreignKey: 'institutionId', as: 'referrals' });

// Referral hasMany ReferralCandidate & ReferralCandidate belongsTo Referral
Referral.hasMany(ReferralCandidate, { foreignKey: 'referralId', as: 'candidates' });
Referral.hasMany(ReferralCandidate, { foreignKey: 'referralId', as: 'referralCandidates' });
ReferralCandidate.belongsTo(Referral, { foreignKey: 'referralId', as: 'referral' });

// User hasOne AlumniCredibility & AlumniCredibility belongsTo User
User.hasOne(AlumniCredibility, { foreignKey: 'alumnusId', as: 'alumniCredibility' });
User.hasOne(AlumniCredibility, { foreignKey: 'alumnusId', as: 'credibility' });
AlumniCredibility.belongsTo(User, { foreignKey: 'alumnusId', as: 'alumnus' });
AlumniCredibility.belongsTo(User, { foreignKey: 'alumnusId', as: 'user' });

// User hasMany Notification & Notification belongsTo User
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User hasMany AuditLog (as actor) & AuditLog belongsTo User (as actor)
User.hasMany(AuditLog, { foreignKey: 'actorId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

// AlumniCredibility hasMany CredibilityHistory & CredibilityHistory belongsTo AlumniCredibility
AlumniCredibility.hasMany(CredibilityHistory, { foreignKey: 'alumniCredibilityId', as: 'histories' });
AlumniCredibility.hasMany(CredibilityHistory, { foreignKey: 'alumniCredibilityId', as: 'credibilityHistories' });
CredibilityHistory.belongsTo(AlumniCredibility, { foreignKey: 'alumniCredibilityId', as: 'alumniCredibility' });
CredibilityHistory.belongsTo(AlumniCredibility, { foreignKey: 'alumniCredibilityId', as: 'credibility' });

// Referral hasMany CredibilityHistory & CredibilityHistory belongsTo Referral
Referral.hasMany(CredibilityHistory, { foreignKey: 'referralId', as: 'credibilityHistories' });
CredibilityHistory.belongsTo(Referral, { foreignKey: 'referralId', as: 'referral' });

// User hasMany Appeal (as submittedBy) & Appeal belongsTo User
User.hasMany(Appeal, { foreignKey: 'submittedBy', as: 'appeals' });
Appeal.belongsTo(User, { foreignKey: 'submittedBy', as: 'submittedByUser' });
Appeal.belongsTo(User, { foreignKey: 'submittedBy', as: 'submitter' });

// Referral hasMany RecruiterInvite & RecruiterInvite belongsTo Referral
Referral.hasMany(RecruiterInvite, { foreignKey: 'referralId', as: 'recruiterInvites' });
Referral.hasMany(RecruiterInvite, { foreignKey: 'referralId', as: 'invites' });
RecruiterInvite.belongsTo(Referral, { foreignKey: 'referralId', as: 'referral' });

// Referral hasMany Notification & Notification belongsTo Referral
Referral.hasMany(Notification, { foreignKey: 'referralId', as: 'notifications' });
Notification.belongsTo(Referral, { foreignKey: 'referralId', as: 'referral' });

// User hasOne CooldownState & CooldownState belongsTo User
User.hasOne(CooldownState, { foreignKey: 'candidateId', as: 'cooldownState' });
CooldownState.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

const models = {
  Institution,
  User,
  Consent,
  Profile,
  SkillEvidence,
  TechSkillScore,
  Referral,
  ReferralCandidate,
  CooldownState,
  AlumniCredibility,
  CredibilityHistory,
  AuditLog,
  Appeal,
  RecruiterInvite,
  Notification,
};

module.exports = {
  sequelize,
  models,
  ...models,
};
