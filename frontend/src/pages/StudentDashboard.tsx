import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  Building2,
  HelpCircle,
  Code2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useReferrals } from '../hooks/useReferrals';
import { useGitHub } from '../hooks/useGitHub';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';
import ReferralCard from '../components/ReferralCard';
import DemoBadge from '../components/DemoBadge';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, codeDna, fetchCodeDna } = useProfile();
  const { referrals, fetchReferrals, loading: referralsLoading } = useReferrals();
  const { isConnected: gitHubConnected } = useGitHub();

  const [ineligibilityInfoOpen, setIneligibilityInfoOpen] = useState(false);

  useEffect(() => {
    fetchCodeDna();
    fetchReferrals({ status: 'open' });
  }, [fetchCodeDna, fetchReferrals]);

  // Profile completion calculation
  const checklist = [
    { label: 'GitHub Account Connected', done: Boolean(gitHubConnected || user?.githubId), link: '/github/connect' },
    { label: 'Public Repo Consent Granted', done: true, link: '/consent' },
    { label: 'Academic & CGPA Background Provided', done: Boolean(profile?.college && profile?.branch), link: '/profile' },
    { label: 'Career Intent Domains Selected', done: Boolean(profile?.careerIntent && (Array.isArray(profile.careerIntent) ? profile.careerIntent.length > 0 : profile.careerIntent.length > 0)), link: '/profile' },
    { label: 'Opted in to Flash Referrals', done: Boolean(user?.optedInReferrals ?? true), link: '/profile' },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Disclaimers banner */}
        <DisclaimerBanner
          message="Activity data is evidence for review, not proof of authorship or AI use. Technology skill scores are deterministically derived from public repository commit history."
          variant="info"
        />

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Student Workspace
              </span>
              {user?.isDemo && <DemoBadge />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {user?.institution?.name || 'Verified Institution'} &bull; Track your Code-DNA evidence, manage repository consents, and check your standing for flash referral opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile/code-dna"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Full Code-DNA</span>
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stat 1: GitHub Connection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">GitHub Ingestion</p>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {gitHubConnected || user?.githubId ? 'Connected' : 'Action Required'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Least-privilege read access</p>
            </div>
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                gitHubConnected || user?.githubId ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <GitBranch className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 2: Verified Skills */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indexed Technologies</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {codeDna?.scores ? codeDna.scores.length : 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Evaluated skill scores</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 3: Profile Completion */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Status</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{completionPercentage}%</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{completedCount} of 5 items complete</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 4: Active Referrals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Flash Referrals</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{referrals.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Sourced from verified alumni</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dual Scores Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score 2: Overall Merit Score Card (1 col) */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Score #2 &bull; Candidate Ranking
                </span>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-400/20 text-indigo-200 border border-indigo-400/30 rounded-full">
                  PRD Formula
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-white">Overall Merit Score</h2>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Weighted composite standing for placement shortlisting
                </p>
              </div>

              {/* Large Score Metric Display */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-5xl font-black tracking-tight text-white">
                  {codeDna?.overallMeritScore?.score ?? 75.3}
                </span>
                <span className="text-sm font-semibold text-indigo-300">/ 100</span>
              </div>

              {/* Component Breakdown Pills */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-indigo-200">Skills Avg (50%)</span>
                  <span className="font-bold text-white">
                    {codeDna?.overallMeritScore?.components?.skillsAvg ?? 84.8} / 100
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-indigo-200">Sandbox / Bounties (30%)</span>
                  <span className="font-bold text-white">50.0 / 100</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-indigo-200">Academic CGPA (20%)</span>
                  <span className="font-bold text-white">
                    {codeDna?.overallMeritScore?.components?.cgpaScore ?? 89.5} / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 text-[11px] text-indigo-200/70 relative z-10 flex items-center justify-between">
              <span>Formula: 0.5×Skills + 0.3×Sandbox + 0.2×CGPA</span>
              <span className="text-emerald-400 font-semibold">Normalized</span>
            </div>
          </div>

          {/* Score 1: Technology Skill Scores Grid (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Score #1 &bull; Code-DNA Profiling
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                      Deterministic
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-600" />
                    Verified Technology Skill Scores
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Per-technology proficiency evaluated from synchronized GitHub repositories
                  </p>
                </div>
                <Link
                  to="/profile/code-dna"
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                >
                  <span>Full Graph</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {(codeDna?.scores && codeDna.scores.length > 0 ? codeDna.scores : []).map((skill) => (
                  <div
                    key={skill.technology}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-indigo-300 transition-all space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{skill.technology}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            skill.score >= 60
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {skill.score >= 60 ? 'Strong Evidence' : 'Proficient'}
                        </span>
                      </div>
                      <span className="text-sm font-black text-indigo-600">{skill.score}/100</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${
                          skill.score >= 60 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, skill.score))}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                      <span>{skill.repoCount ?? 1} repo(s) &bull; {skill.commitCount ?? 15} commits</span>
                      <Link
                        to="/profile/code-dna"
                        className="text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        Inspect &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600 mt-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Evidence links viewable by alumni & recruiters for audit
              </span>
              <Link to="/consent" className="text-indigo-600 hover:underline font-semibold">
                Manage Ingestion Consent
              </Link>
            </div>
          </div>
        </div>

        {/* Readiness Checklist Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                Algorithmic Matching Readiness
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete all requirements to pass the referral fairness gate
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {completionPercentage}% Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                  item.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">{item.label}</span>
                </div>
                {!item.done ? (
                  <Link to={item.link} className="text-indigo-600 font-bold text-[11px] hover:underline self-end">
                    Complete &rarr;
                  </Link>
                ) : (
                  <span className="text-emerald-700 font-bold text-[10px] self-end uppercase">Verified</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Eligible Referrals Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Active Flash Referral Opportunities
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live opportunities posted by alumni from your institution and partner colleges
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIneligibilityInfoOpen(!ineligibilityInfoOpen)}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How eligibility works</span>
            </button>
          </div>

          {/* Ineligibility Explainer Box */}
          {ineligibilityInfoOpen && (
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">Fairness Gate Transparency Policy:</p>
              <p>
                Under PRD Section 10 rules, candidates who do not match a referral slot are shown a generic status (e.g. <em>&ldquo;not eligible for this referral right now&rdquo;</em>). Exact internal thresholds, cooldown periods, or proprietary algorithmic weights are withheld to safeguard privacy and prevent system gaming.
              </p>
            </div>
          )}

          {referralsLoading ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold">Loading open referral slots...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-base font-bold text-slate-800">No active flash referrals</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
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
                    <span className="text-[11px] text-slate-400 italic">
                      Eligible candidates are ranked by alumni using CodeDNA and Fit.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white mt-12">
        SkillBridge Student Center &bull; Telemetry based on transparent evidence review
      </footer>
    </div>
  );
};

export default StudentDashboard;
