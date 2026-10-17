const {
  sequelize,
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
} = require('../models');

async function seed() {
  console.log('--- Starting SkillBridge Database Seeding ---');

  // 1. Sync the database (force: true in dev)
  console.log('Syncing database schema (force: true)...');
  await sequelize.sync({ force: true });
  console.log('Database synced successfully.');

  // 2. Create 2 demo institutions
  console.log('Creating demo institutions...');
  const demoUniv = await Institution.create({
    name: 'Demo University',
    allowedEmailDomains: ['demo.edu'],
  });

  const demoTech = await Institution.create({
    name: 'Demo Tech College',
    allowedEmailDomains: ['demotech.edu'],
  });

  // 3. Create demo users (all with isDemo: true)
  console.log('Creating demo users...');
  // Admin
  const admin = await User.create({
    email: 'admin@demo.edu',
    name: 'Demo Admin',
    role: 'admin',
    institutionId: demoUniv.id,
    isDemo: true,
    isVerified: true,
  });

  // 3 students
  const student1 = await User.create({
    email: 'student1@demo.edu',
    name: 'Demo Student One',
    role: 'student',
    institutionId: demoUniv.id,
    googleId: 'demo-google-student-1',
    githubId: 'demo-student-1',
    githubAccessToken: 'demo_token_student_1',
    isDemo: true,
    isVerified: true,
    optedInReferrals: true,
  });

  const student2 = await User.create({
    email: 'student2@demo.edu',
    name: 'Demo Student Two',
    role: 'student',
    institutionId: demoUniv.id,
    googleId: 'demo-google-student-2',
    githubId: 'demo-student-2',
    githubAccessToken: 'demo_token_student_2',
    isDemo: true,
    isVerified: true,
    optedInReferrals: true,
  });

  const student3 = await User.create({
    email: 'student3@demotech.edu',
    name: 'Demo Student Three',
    role: 'student',
    institutionId: demoTech.id,
    googleId: 'demo-google-student-3',
    githubId: 'demo-student-3',
    githubAccessToken: 'demo_token_student_3',
    isDemo: true,
    isVerified: true,
    optedInReferrals: true,
  });

  // 2 alumni
  const alumni1 = await User.create({
    email: 'alumni1@demo.edu',
    name: 'Demo Alumni One',
    role: 'alumni',
    institutionId: demoUniv.id,
    googleId: 'demo-google-alumni-1',
    isDemo: true,
    isVerified: true,
    optedInReferrals: false,
  });

  const alumni2 = await User.create({
    email: 'alumni2@demotech.edu',
    name: 'Demo Alumni Two',
    role: 'alumni',
    institutionId: demoTech.id,
    googleId: 'demo-google-alumni-2',
    isDemo: true,
    isVerified: true,
    optedInReferrals: false,
  });

  // 1 recruiter
  const recruiter = await User.create({
    email: 'recruiter@company.com',
    name: 'Demo Recruiter',
    role: 'recruiter',
    googleId: 'demo-google-recruiter-1',
    isDemo: true,
    isVerified: true,
  });

  // 1 founder
  const founder = await User.create({
    email: 'founder@startup.com',
    name: 'Demo Founder',
    role: 'founder',
    googleId: 'demo-google-founder-1',
    isDemo: true,
    isVerified: true,
  });

  // Credibility records for alumni
  const alumni1Cred = await AlumniCredibility.create({
    alumnusId: alumni1.id,
    score: 100,
  });

  const alumni2Cred = await AlumniCredibility.create({
    alumnusId: alumni2.id,
    score: 100,
  });

  // 4. Create consent records for students (github_public granted)
  console.log('Creating student consent records...');
  await Consent.bulkCreate([
    {
      userId: student1.id,
      source: 'github_public',
      grantedAt: new Date(),
    },
    {
      userId: student2.id,
      source: 'github_public',
      grantedAt: new Date(),
    },
    {
      userId: student3.id,
      source: 'github_public',
      grantedAt: new Date(),
    },
  ]);

  // 5. Create profiles for students with realistic data
  console.log('Creating student profiles...');
  await Profile.bulkCreate([
    {
      userId: student1.id,
      college: 'Demo University',
      branchProgram: 'Computer Science and Engineering',
      graduationYear: 2026,
      cgpa: 8.95,
      careerIntent: {
        targetRoles: ['Full Stack Engineer', 'Backend Developer'],
        targetDomains: ['FinTech', 'Developer Tools'],
        workMode: 'Hybrid',
      },
      summary:
        'Passionate full-stack developer with experience building production Node.js microservices and interactive React web apps.',
    },
    {
      userId: student2.id,
      college: 'Demo University',
      branchProgram: 'Information Technology',
      graduationYear: 2026,
      cgpa: 8.42,
      careerIntent: {
        targetRoles: ['Frontend Engineer', 'UI/UX Engineer'],
        targetDomains: ['SaaS', 'EdTech'],
        workMode: 'Remote',
      },
      summary:
        'Frontend-focused software engineer specializing in React, TypeScript, and modern component design systems.',
    },
    {
      userId: student3.id,
      college: 'Demo Tech College',
      branchProgram: 'Software Engineering',
      graduationYear: 2027,
      cgpa: 9.15,
      careerIntent: {
        targetRoles: ['Backend Engineer', 'Systems Engineer'],
        targetDomains: ['Cloud Infrastructure', 'Distributed Systems'],
        workMode: 'On-site',
      },
      summary:
        'Backend specialist with high-throughput API architecture experience in Python, FastAPI, and PostgreSQL optimization.',
    },
  ]);

  // 6. Create skill evidence for students
  console.log('Creating skill evidence records...');
  await SkillEvidence.bulkCreate([
    // Student 1
    {
      userId: student1.id,
      technology: 'JavaScript',
      source: 'github',
      commitCount: 154,
      repoCount: 6,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-1/skillbridge-clone',
          url: 'https://github.com/demo-student-1/skillbridge-clone',
          description: 'Collaborative skills portal backend in Express and PostgreSQL',
        },
        {
          repo: 'demo-student-1/async-task-engine',
          url: 'https://github.com/demo-student-1/async-task-engine',
          description: 'Message queue consumer with Redis and Node.js',
        },
      ],
    },
    {
      userId: student1.id,
      technology: 'React',
      source: 'github',
      commitCount: 112,
      repoCount: 4,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-1/portfolio-v2',
          url: 'https://github.com/demo-student-1/portfolio-v2',
          description: 'Responsive portfolio built with React and Tailwind CSS',
        },
      ],
    },
    {
      userId: student1.id,
      technology: 'Node.js',
      source: 'github',
      commitCount: 138,
      repoCount: 5,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-1/auth-microservice',
          url: 'https://github.com/demo-student-1/auth-microservice',
          description: 'OAuth2 and JWT token authentication server',
        },
      ],
    },
    {
      userId: student1.id,
      technology: 'PostgreSQL',
      source: 'github',
      commitCount: 64,
      repoCount: 3,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-1/auth-microservice',
          url: 'https://github.com/demo-student-1/auth-microservice',
          description: 'Sequelize schema migrations, foreign keys, and indexing',
        },
      ],
    },
    // Student 2
    {
      userId: student2.id,
      technology: 'JavaScript',
      source: 'github',
      commitCount: 195,
      repoCount: 8,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-2/analytics-dashboard',
          url: 'https://github.com/demo-student-2/analytics-dashboard',
          description: 'Interactive real-time metrics dashboard',
        },
      ],
    },
    {
      userId: student2.id,
      technology: 'React',
      source: 'github',
      commitCount: 230,
      repoCount: 7,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-2/ui-component-kit',
          url: 'https://github.com/demo-student-2/ui-component-kit',
          description: 'Accessible headless component library',
        },
      ],
    },
    {
      userId: student2.id,
      technology: 'TypeScript',
      source: 'github',
      commitCount: 140,
      repoCount: 5,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-2/ui-component-kit',
          url: 'https://github.com/demo-student-2/ui-component-kit',
          description: 'Strict typing and Generics implementation',
        },
      ],
    },
    // Student 3
    {
      userId: student3.id,
      technology: 'Python',
      source: 'github',
      commitCount: 245,
      repoCount: 9,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-3/fastapi-data-service',
          url: 'https://github.com/demo-student-3/fastapi-data-service',
          description: 'Asynchronous ETL pipeline for financial metrics',
        },
      ],
    },
    {
      userId: student3.id,
      technology: 'PostgreSQL',
      source: 'github',
      commitCount: 92,
      repoCount: 5,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-3/fastapi-data-service',
          url: 'https://github.com/demo-student-3/fastapi-data-service',
          description: 'Partitioned tables and query optimization',
        },
      ],
    },
    {
      userId: student3.id,
      technology: 'Node.js',
      source: 'github',
      commitCount: 78,
      repoCount: 3,
      lastActivity: new Date(),
      evidenceRefs: [
        {
          repo: 'demo-student-3/cli-dev-tools',
          url: 'https://github.com/demo-student-3/cli-dev-tools',
          description: 'Developer CLI tool for schema validation',
        },
      ],
    },
  ]);

  // 7. Create tech skill scores for students
  console.log('Creating tech skill scores...');
  await TechSkillScore.bulkCreate([
    // Student 1
    { userId: student1.id, technology: 'JavaScript', score: 88.5, computedAt: new Date() },
    { userId: student1.id, technology: 'React', score: 84.0, computedAt: new Date() },
    { userId: student1.id, technology: 'Node.js', score: 86.5, computedAt: new Date() },
    { userId: student1.id, technology: 'PostgreSQL', score: 80.0, computedAt: new Date() },
    // Student 2
    { userId: student2.id, technology: 'JavaScript', score: 93.0, computedAt: new Date() },
    { userId: student2.id, technology: 'React', score: 95.0, computedAt: new Date() },
    { userId: student2.id, technology: 'TypeScript', score: 88.0, computedAt: new Date() },
    // Student 3
    { userId: student3.id, technology: 'Python', score: 92.5, computedAt: new Date() },
    { userId: student3.id, technology: 'PostgreSQL', score: 87.0, computedAt: new Date() },
    { userId: student3.id, technology: 'Node.js', score: 77.5, computedAt: new Date() },
  ]);

  // Cooldown states for students
  await CooldownState.bulkCreate([
    { candidateId: student1.id, referralCount: 0, cooldownUntil: null },
    { candidateId: student2.id, referralCount: 0, cooldownUntil: null },
    { candidateId: student3.id, referralCount: 1, cooldownUntil: null },
  ]);

  // 8. Create 2 demo referrals (one open, one expired) with candidates ranked
  console.log('Creating demo referrals and candidates...');
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

  // Referral 1: Open
  const referral1 = await Referral.create({
    alumnusId: alumni1.id,
    institutionId: demoUniv.id,
    company: 'Acme Technologies',
    roleTitle: 'Junior Full Stack Engineer',
    requiredTechnologies: ['JavaScript', 'React', 'Node.js'],
    slots: 2,
    description:
      'Opportunity in the core platform engineering team at Acme Technologies. Seeking engineers with strong JavaScript, React, and Node.js capabilities.',
    expiresAt: new Date(Date.now() + oneWeekInMs),
    status: 'open',
    openToOtherColleges: true,
    recruiterEmail: 'recruiter@company.com',
    outcome: 'pending',
    outcomeReason: null,
  });

  // Ranked candidates for Referral 1
  await ReferralCandidate.bulkCreate([
    {
      referralId: referral1.id,
      candidateId: student1.id,
      rank: 1,
      matchScore: 88.5,
      codeDnaScore: 89.0,
      sandboxScore: 87.0,
      fitScore: 90.0,
      status: 'ranked',
    },
    {
      referralId: referral1.id,
      candidateId: student2.id,
      rank: 2,
      matchScore: 83.5,
      codeDnaScore: 85.0,
      sandboxScore: 82.0,
      fitScore: 83.0,
      status: 'ranked',
    },
    {
      referralId: referral1.id,
      candidateId: student3.id,
      rank: 3,
      matchScore: 75.0,
      codeDnaScore: 74.0,
      sandboxScore: 76.0,
      fitScore: 76.0,
      status: 'ranked',
    },
  ]);

  // Recruiter Invite for Referral 1
  await RecruiterInvite.create({
    referralId: referral1.id,
    email: 'recruiter@company.com',
    token: 'demo_token_acme_invite_001',
    expiresAt: new Date(Date.now() + oneWeekInMs),
    accepted: false,
  });

  // Referral 2: Expired / outcome successful
  const referral2 = await Referral.create({
    alumnusId: alumni2.id,
    institutionId: demoTech.id,
    company: 'CloudScale Labs',
    roleTitle: 'Backend Software Intern',
    requiredTechnologies: ['Python', 'PostgreSQL'],
    slots: 1,
    description:
      'CloudScale Labs data infrastructure team. Working on high-throughput ingestion pipelines and database indexing.',
    expiresAt: new Date(Date.now() - threeDaysInMs),
    status: 'expired',
    openToOtherColleges: false,
    recruiterEmail: 'hiring@cloudscale.io',
    outcome: 'successful',
    outcomeReason: 'Candidate successfully passed coding evaluation and culture interview. Offer accepted.',
  });

  // Referred candidate for Referral 2
  const referral2Candidate = await ReferralCandidate.create({
    referralId: referral2.id,
    candidateId: student3.id,
    rank: 1,
    matchScore: 91.2,
    codeDnaScore: 92.0,
    sandboxScore: 90.0,
    fitScore: 91.0,
    status: 'referred',
  });

  // Credibility history for Alumni 2's successful referral
  await CredibilityHistory.create({
    alumniCredibilityId: alumni2Cred.id,
    change: 15.0,
    reason: 'Successful referral outcome confirmed for CloudScale Labs',
    referralId: referral2.id,
  });

  // Update alumni2 credibility score to reflect the successful referral bonus
  alumni2Cred.score = 115.0;
  await alumni2Cred.save();

  // 9. Create sample audit log entries
  console.log('Creating sample audit logs...');
  await AuditLog.bulkCreate([
    {
      actorId: admin.id,
      action: 'VERIFY_ALUMNUS',
      entityType: 'User',
      entityId: alumni1.id,
      before: { isVerified: false },
      after: { isVerified: true },
      reason: 'Verified alumnus credentials via institutional domain check',
    },
    {
      actorId: alumni1.id,
      action: 'CREATE_REFERRAL',
      entityType: 'Referral',
      entityId: referral1.id,
      before: null,
      after: { company: 'Acme Technologies', roleTitle: 'Junior Full Stack Engineer', slots: 2 },
      reason: 'Alumnus posted flash referral slot',
    },
    {
      actorId: null,
      action: 'MATCH_CANDIDATES',
      entityType: 'Referral',
      entityId: referral1.id,
      before: null,
      after: { totalCandidatesEvaluated: 3, topRankedCount: 3 },
      reason: 'Automated ranking engine evaluated eligible candidates against role requirements',
    },
    {
      actorId: alumni2.id,
      action: 'SELECT_REFERRAL_CANDIDATE',
      entityType: 'ReferralCandidate',
      entityId: referral2Candidate.id,
      before: { status: 'ranked' },
      after: { status: 'referred' },
      reason: 'Alumnus selected top ranked candidate for CloudScale Labs position',
    },
    {
      actorId: recruiter.id,
      action: 'CONFIRM_OUTCOME',
      entityType: 'Referral',
      entityId: referral2.id,
      before: { outcome: 'pending' },
      after: { outcome: 'successful', credibilityBonus: 15 },
      reason: 'Recruiter confirmed successful candidate hire',
    },
  ]);

  // Sample Appeal
  await Appeal.create({
    entityType: 'credibility_change',
    entityId: referral2.id,
    submittedBy: alumni1.id,
    text: 'Requesting administrative review of referral score adjustment baseline.',
    status: 'pending',
    adminReason: null,
    reviewedAt: null,
  });

  // 10. Create sample notifications
  console.log('Creating sample notifications...');
  await Notification.bulkCreate([
    {
      userId: student1.id,
      type: 'referral_posted',
      message: 'A new referral for Junior Full Stack Engineer at Acme Technologies is open for your institution.',
      referralId: referral1.id,
      read: false,
    },
    {
      userId: student2.id,
      type: 'referral_posted',
      message: 'A new referral for Junior Full Stack Engineer at Acme Technologies is open for your institution.',
      referralId: referral1.id,
      read: true,
    },
    {
      userId: student3.id,
      type: 'outcome_confirmed',
      message: 'Congratulations! Your referral for Backend Software Intern at CloudScale Labs was marked as successful!',
      referralId: referral2.id,
      read: false,
    },
    {
      userId: alumni2.id,
      type: 'outcome_confirmed',
      message: 'Outcome confirmed for CloudScale Labs: Candidate successfully hired. +15 Credibility awarded!',
      referralId: referral2.id,
      read: true,
    },
    {
      userId: alumni1.id,
      type: 'referral_posted',
      message: 'Your flash referral for Junior Full Stack Engineer has been published with 3 ranked candidates.',
      referralId: referral1.id,
      read: true,
    },
  ]);

  console.log('--- SkillBridge Database Seeding Complete ---');
}

if (require.main === module) {
  seed()
    .then(async () => {
      console.log('Seeding process finished successfully.');
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Seeding process failed:', error);
      try {
        await sequelize.close();
      } catch (closeErr) {
        // ignore
      }
      process.exit(1);
    });
}

module.exports = seed;
