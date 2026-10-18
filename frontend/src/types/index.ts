export interface Institution {
  id: string;
  name: string;
  allowedEmailDomains: string[];
  createdAt?: string;
}

export interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  durationMonths: number;
  description: string;
  verificationLink?: string;
}

export interface Profile {
  id?: string;
  userId: string;
  college?: string;
  branch?: string;
  branchProgram?: string;
  graduationYear?: number;
  cgpa?: number; // self-reported, not verified
  careerIntent?: string[] | string | { targetRoles?: string[]; targetDomains?: string[]; workMode?: string };
  summary?: string;
  experience?: ExperienceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'alumni' | 'recruiter' | 'founder' | 'admin';
  institutionId: string | null;
  institution?: { id: string; name: string };
  isDemo: boolean;
  isVerified: boolean;
  optedInReferrals: boolean;
  githubId: string | null;
  profile?: Profile;
  createdAt?: string;
  updatedAt?: string;
}

export interface Consent {
  id?: string;
  userId: string;
  publicReposGranted: boolean;
  privateReposGranted: boolean;
  grantedAt?: string | null;
  revokedAt?: string | null;
  updatedAt?: string;
}

export interface SkillEvidence {
  id?: string;
  userId?: string;
  technology: string;
  repoCount: number;
  commitCount: number;
  prCount?: number;
  linesOfCode?: number;
  lastActivityAt?: string;
  evidenceUrls: string[];
  sampleRepos?: {
    name: string;
    url: string;
    commits: number;
    languages?: string[];
  }[];
  libraries?: string[];
}

export interface TechSkillScore {
  id?: string;
  userId?: string;
  technology: string;
  score: number; // 0 - 100
  repoCount?: number;
  commitCount?: number;
  computedAt: string;
  evidenceLinks?: string[];
}

export interface ReferralCandidate {
  id: string;
  referralId: string;
  candidateId: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
    profile?: Profile;
  };
  rank: number;
  matchScore: number;
  codeDnaScore: number;
  sandboxScore: number; // Placeholder — 50 (Phase 1)
  fitScore: number;
  experienceBonus?: number;
  experienceSummary?: {
    count: number;
    totalMonths: number;
    items: ExperienceItem[];
  };
  status: 'ranked' | 'referred' | 'rejected' | 'selected';
  skippedReason?: string | null;
  createdAt?: string;
}

export interface Referral {
  id: string;
  alumnusId: string;
  alumnus?: {
    id: string;
    name: string;
    email: string;
    isDemo?: boolean;
  };
  institutionId?: string;
  institution?: {
    id: string;
    name: string;
  };
  company: string;
  roleTitle: string;
  requiredTechnologies: string[];
  slots: number;
  slotsRemaining?: number;
  description: string;
  expiresAt: string;
  openToOtherColleges: boolean;
  recruiterEmail?: string;
  status: 'open' | 'closed' | 'expired';
  isDemo?: boolean;
  candidates?: ReferralCandidate[];
  myMatch?: {
    rank: number;
    matchScore: number;
    status: string;
    codeDnaScore: number;
    sandboxScore: number;
    fitScore: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CredibilityHistory {
  id: string;
  credibilityId?: string;
  alumnusId: string;
  changeAmount: number; // e.g. +15 or -20
  previousScore: number;
  newScore: number;
  reason: string;
  referralId?: string;
  referralTitle?: string;
  appealId?: string;
  canAppeal?: boolean;
  hasAppealed?: boolean;
  createdAt: string;
}

export interface AlumniCredibility {
  id?: string;
  alumnusId: string;
  score: number;
  history?: CredibilityHistory[];
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'referral' | 'credibility' | 'verification' | 'system' | 'consent' | 'invite';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  reason: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  timestamp: string;
}

export interface Appeal {
  id: string;
  credibilityHistoryId?: string;
  referralId?: string;
  submittedBy: string;
  alumnusName?: string;
  reason: string;
  status: 'pending' | 'upheld' | 'reversed';
  adminNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface RecruiterInvite {
  id: string;
  referralId: string;
  token: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  referral?: Referral;
  createdAt: string;
}

export interface CodeDnaData {
  skills: SkillEvidence[];
  scores: TechSkillScore[];
  experience?: ExperienceItem[];
  experienceSummary?: {
    totalMonths: number;
    count: number;
    bonus: number;
  };
  overallMeritScore?: {
    score: number;
    maxScore: number;
    components: {
      skillsAvg: number;
      skillsWeight: number;
      bountiesScore: number;
      bountiesWeight: number;
      bountiesLabel: string;
      cgpaScore: number;
      cgpaWeight: number;
      cgpaRaw: number;
    };
    formula: string;
  };
  lastComputedAt?: string;
  disclaimer: string;
}

export interface GitHubStatus {
  isConnected: boolean;
  publicGranted: boolean;
  privateGranted: boolean;
  username?: string;
  lastSyncedAt?: string;
  publicRepoCount?: number;
  privateRepoCount?: number;
}
