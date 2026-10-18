import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  GitBranch,
  Building2,
  FileCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  Code2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useReferrals } from '../hooks/useReferrals';
import { useGitHub } from '../hooks/useGitHub';
import Navbar from '../components/Navbar';
import ReferralCard from '../components/ReferralCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DemoBadge from '../components/DemoBadge';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, codeDna } = useProfile();
  const { referrals, loading: referralsLoading } = useReferrals();
  const { isConnected: gitHubConnected } = useGitHub();

  const [ineligibilityInfoOpen, setIneligibilityInfoOpen] = useState(false);

  // Profile completion status
  const checklist = [
    { label: 'Campus Email Verification', done: Boolean(user?.institutionId || user?.isVerified), link: '/profile' },
    { label: 'Public GitHub Repositories Linked', done: Boolean(gitHubConnected || user?.githubId), link: '/github/connect' },
    { label: 'Academic & CGPA Background Provided', done: Boolean(profile?.college && (profile?.branch || profile?.branchProgram)), link: '/profile' },
    { label: 'Career Intent Domains Selected', done: Boolean(profile?.careerIntent && (Array.isArray(profile.careerIntent) ? profile.careerIntent.length > 0 : String(profile.careerIntent).length > 0)), link: '/profile' },
    { label: 'Opted in to Flash Referrals', done: Boolean(user?.optedInReferrals ?? true), link: '/profile' },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="min-h-screen bg-[#071519] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Disclaimers banner */}
        <DisclaimerBanner
          message="Activity data is evidence for review, not proof of authorship or AI use. Technology skill scores are deterministically derived from public repository commit history."
          variant="info"
        />

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a1f24] p-6 sm:p-8 rounded-3xl border border-teal-900/60 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Student Engineering Workspace
              </span>
              {user?.isDemo && <DemoBadge />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              {user?.institution?.name || 'Verified Institution'} &bull; Track your Code-DNA evidence, manage repository consents, and check your standing for flash referral opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile/code-dna"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-copper-600 hover:bg-copper-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-copper-900/40 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Full Code-DNA</span>
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#061013] hover:bg-teal-950 text-slate-200 border border-teal-900/80 text-xs font-bold rounded-xl transition-all"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stat 1: GitHub Connection */}
          <div className="bg-[#0a1f24] p-5 rounded-3xl border border-teal-900/60 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">GitHub Ingestion</p>
              <h3 className="text-lg font-black text-white mt-1">
                {gitHubConnected || user?.githubId ? 'Connected' : 'Action Required'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Least-privilege read access</p>
            </div>
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                gitHubConnected || user?.githubId ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-amber-950 border border-amber-800 text-amber-400'
              }`}
            >
              <GitBranch className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 2: Verified Skills */}
          <div className="bg-[#0a1f24] p-5 rounded-3xl border border-teal-900/60 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indexed Technologies</p>
              <h3 className="text-2xl font-black text-brand-400 mt-1">
                {codeDna?.scores ? codeDna.scores.length : 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Evaluated skill scores</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-950 border border-teal-800 text-brand-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 3: Profile Completion */}
          <div className="bg-[#0a1f24] p-5 rounded-3xl border border-teal-900/60 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Status</p>
              <h3 className="text-2xl font-black text-white mt-1">{completionPercentage}%</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{completedCount} of 5 items complete</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-950 border border-teal-800 text-copper-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 4: Active Referrals */}
          <div className="bg-[#0a1f24] p-5 rounded-3xl border border-teal-900/60 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Flash Referrals</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{referrals.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Sourced from verified alumni</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-950 border border-teal-800 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dual Scores Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score 2: Overall Merit Score Card (1 col) */}
          <div className="bg-gradient-to-br from-teal-950 via-[#0a1f24] to-[#061013] rounded-3xl p-6 sm:p-7 text-white shadow-2xl border border-brand-500/40 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-copper-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-copper-400" />
                  Score #2 &bull; Placement Standing
                </span>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-teal-900/60 text-brand-300 border border-teal-700/60 rounded-full">
                  PRD Formula
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-white">Overall Merit Score</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Weighted composite standing for placement shortlisting
                </p>
              </div>

              {/* Large Score Metric Display */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-5xl font-black tracking-tight text-brand-300">
                  {codeDna?.overallMeritScore?.score ?? 75.3}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>

              {/* Component Breakdown Pills */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061013]/80 border border-teal-900/60">
                  <span className="text-slate-300">Skills Avg (50%)</span>
                  <span className="font-bold text-brand-300">
                    {codeDna?.overallMeritScore?.components?.skillsAvg ?? 84.8} / 100
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061013]/80 border border-teal-900/60">
                  <span className="text-slate-300">Sandbox / Bounties (30%)</span>
                  <span className="font-bold text-copper-300">50.0 / 100</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061013]/80 border border-teal-900/60">
                  <span className="text-slate-300">Academic CGPA (20%)</span>
                  <span className="font-bold text-emerald-300">
                    {codeDna?.overallMeritScore?.components?.cgpaScore ?? 89.5} / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-teal-900/60 text-[11px] text-slate-400 relative z-10 flex items-center justify-between">
              <span>0.5×Skills + 0.3×Sandbox + 0.2×CGPA</span>
              <span className="text-emerald-400 font-semibold">Normalized</span>
            </div>
          </div>

          {/* Score 1: Technology Skill Scores Grid (2 cols) */}
          <div className="lg:col-span-2 bg-[#0a1f24] rounded-3xl border border-teal-900/60 shadow-xl p-6 sm:p-7 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-teal-900/50 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                      Score #1 &bull; Code-DNA Profiling
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-950 text-emerald-400 border border-emerald-800 rounded-full">
                      Deterministic
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-brand-400" />
                    Verified Technology Skill Scores
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Per-technology proficiency evaluated from synchronized GitHub repositories
                  </p>
                </div>
                <Link
                  to="/profile/code-dna"
                  className="px-3.5 py-2 bg-teal-950/80 hover:bg-teal-900 text-brand-300 text-xs font-bold rounded-xl border border-teal-800 transition flex items-center gap-1"
                >
                  <span>Full Graph</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {(codeDna?.scores && codeDna.scores.length > 0 ? codeDna.scores : []).map((skill) => (
                  <div
                    key={skill.technology}
                    className="p-4 rounded-2xl border border-teal-900/60 bg-[#061013] hover:border-brand-500/60 transition-all space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{skill.technology}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            skill.score >= 60
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {skill.score >= 60 ? 'Strong Evidence' : 'Proficient'}
                        </span>
                      </div>
                      <span className="text-sm font-black text-brand-400">{skill.score}/100</span>
                    </div>

                    <div className="w-full bg-[#0a1f24] h-2 rounded-full overflow-hidden border border-teal-900/40">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          skill.score >= 60 ? 'bg-gradient-to-r from-brand-500 to-emerald-400' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, skill.score))}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                      <span>{skill.repoCount ?? 1} repo(s) &bull; {skill.commitCount ?? 15} commits</span>
                      <Link
                        to="/profile/code-dna"
                        className="text-copper-400 hover:text-copper-300 font-bold"
                      >
                        Inspect &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#061013] rounded-2xl border border-teal-900/60 flex items-center justify-between text-xs text-slate-400 mt-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Evidence links viewable by alumni & recruiters for audit
              </span>
              <Link to="/consent" className="text-brand-300 hover:underline font-semibold">
                Manage Ingestion Consent
              </Link>
            </div>
          </div>
        </div>

        {/* Readiness Checklist Card */}
        <div className="bg-[#0a1f24] rounded-3xl border border-teal-900/60 shadow-xl p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-900/40 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-copper-400" />
                Algorithmic Matching Readiness
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete all requirements to pass the referral fairness gate
              </p>
            </div>
            <span className="text-xs font-bold text-brand-300 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              {completionPercentage}% Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
                  item.done ? 'bg-[#061013] border-teal-800/80' : 'bg-[#061013] border-teal-950 opacity-75'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">{item.label}</span>
                </div>
                {!item.done ? (
                  <Link to={item.link} className="text-copper-400 font-bold text-[11px] hover:underline self-end">
                    Complete &rarr;
                  </Link>
                ) : (
                  <span className="text-emerald-400 font-bold text-[10px] self-end uppercase">Verified</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Eligible Referrals Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-900/50 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-copper-400" />
                Active Flash Referral Opportunities
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live opportunities posted by alumni from your institution and partner colleges
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIneligibilityInfoOpen(!ineligibilityInfoOpen)}
              className="text-xs font-semibold text-slate-400 hover:text-brand-300 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How eligibility works</span>
            </button>
          </div>

          {/* Ineligibility Explainer Box */}
          {ineligibilityInfoOpen && (
            <div className="p-4 bg-[#0a1f24] rounded-2xl border border-teal-900/70 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-white">Fairness Gate Transparency Policy:</p>
              <p>
                Under PRD Section 10 rules, candidates who do not match a referral slot are shown a generic status (e.g. <em>&ldquo;not eligible for this referral right now&rdquo;</em>). Exact internal thresholds, cooldown periods, or proprietary algorithmic weights are withheld to safeguard privacy and prevent system gaming.
              </p>
            </div>
          )}

          {referralsLoading ? (
            <div className="py-16 text-center bg-[#0a1f24] rounded-3xl border border-teal-900/50 shadow-xl space-y-3">
              <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-400">Loading open referral slots...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-16 text-center bg-[#0a1f24] rounded-3xl border border-teal-900/50 p-8 shadow-xl">
              <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-base font-bold text-white">No active flash referrals</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Alumni post flash referrals periodically. Check back often or ensure your Code-DNA profile is up to date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {referrals.map((ref) => (
                <div key={ref.id} className="relative">
                  <ReferralCard referral={ref} />
                  {/* Generic student privacy disclaimer label */}
                  <div className="mt-2 text-center">
                    <span className="text-[11px] text-slate-500 italic">
                      Eligible candidates are ranked by alumni using CodeDNA and Fit.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-teal-900/40 bg-[#061013] mt-12">
        SkillBridge Student Center &bull; Telemetry based on transparent evidence review
      </footer>
    </div>
  );
};

export default StudentDashboard;
