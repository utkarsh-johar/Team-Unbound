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
import PaletteBar from '../components/PaletteBar';
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
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900 flex flex-col justify-between selection:bg-[#238480] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Disclaimers banner */}
        <DisclaimerBanner
          message="Activity data is evidence for review, not proof of authorship or AI use. Technology skill scores are deterministically derived from public repository commit history."
          variant="info"
        />

        {/* Welcome Header with Patch Ocean Teal Gradient */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-[#065861] via-[#125b63] to-[#151717] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#238480]">
                Student Engineering Workspace
              </span>
              {user?.isDemo && <DemoBadge />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {user?.institution?.name || 'Verified Institution'} &bull; Track your Code-DNA evidence, manage repository consents, and check your standing for flash referral opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile/code-dna"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#fd5800] hover:bg-[#e04e00] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Full Code-DNA</span>
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl backdrop-blur transition-all"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stat 1: GitHub Connection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">GitHub Ingestion</p>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {gitHubConnected || user?.githubId ? 'Connected' : 'Action Required'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Least-privilege read access</p>
            </div>
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                gitHubConnected || user?.githubId ? 'bg-[#238480]/15 text-[#238480]' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <GitBranch className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 2: Verified Skills */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indexed Technologies</p>
              <h3 className="text-2xl font-black text-[#125b63] mt-1">
                {codeDna?.scores ? codeDna.scores.length : 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Evaluated skill scores</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#125b63]/10 text-[#125b63] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 3: Profile Completion */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Status</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{completionPercentage}%</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{completedCount} of 5 items complete</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#fd5800]/10 text-[#fd5800] flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 4: Active Referrals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Flash Referrals</p>
              <h3 className="text-2xl font-black text-[#238480] mt-1">{referrals.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Sourced from verified alumni</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#238480]/10 text-[#238480] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dual Scores Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score 2: Overall Merit Score Card (1 col) */}
          <div className="bg-gradient-to-br from-[#065861] via-[#125b63] to-[#151717] rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#fd5800]" />
                  Score #2 &bull; Placement Standing
                </span>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-white/20 text-white rounded-full">
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
                <span className="text-5xl font-black tracking-tight text-white">
                  {codeDna?.overallMeritScore?.score ?? 75.3}
                </span>
                <span className="text-sm font-semibold text-slate-300">/ 100</span>
              </div>

              {/* Component Breakdown Pills */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/15">
                  <span className="text-slate-200">Skills Avg (50%)</span>
                  <span className="font-bold text-white">
                    {codeDna?.overallMeritScore?.components?.skillsAvg ?? 84.8} / 100
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/15">
                  <span className="text-slate-200">Sandbox Baseline (30%)</span>
                  <span className="font-bold text-[#fd5800]">50.0 / 100</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/15">
                  <span className="text-slate-200">Academic CGPA (20%)</span>
                  <span className="font-bold text-[#238480]">
                    {codeDna?.overallMeritScore?.components?.cgpaScore ?? 89.5} / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/15 text-[11px] text-slate-300 relative z-10 flex items-center justify-between">
              <span>0.5×Skills + 0.3×Sandbox + 0.2×CGPA</span>
              <span className="text-[#238480] font-semibold">Normalized</span>
            </div>
          </div>

          {/* Score 1: Technology Skill Scores Grid (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#125b63]">
                      Score #1 &bull; Code-DNA Profiling
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#238480]/10 text-[#238480] rounded-full">
                      Deterministic
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#125b63]" />
                    Verified Technology Skill Scores
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Per-technology proficiency evaluated from synchronized GitHub repositories
                  </p>
                </div>
                <Link
                  to="/profile/code-dna"
                  className="px-3.5 py-2 bg-slate-50 hover:bg-[#125b63]/10 text-[#125b63] text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1"
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
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-[#125b63] transition-all space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{skill.technology}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            skill.score >= 60
                              ? 'bg-[#238480]/10 text-[#238480] border border-[#238480]/20'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {skill.score >= 60 ? 'Strong Evidence' : 'Proficient'}
                        </span>
                      </div>
                      <span className="text-sm font-black text-[#125b63]">{skill.score}/100</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          skill.score >= 60 ? 'bg-[#125b63]' : 'bg-[#fd5800]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, skill.score))}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                      <span>{skill.repoCount ?? 1} repo(s) &bull; {skill.commitCount ?? 15} commits</span>
                      <Link
                        to="/profile/code-dna"
                        className="text-[#fd5800] hover:underline font-bold"
                      >
                        Inspect &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600 mt-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#238480]" />
                Evidence links viewable by alumni & recruiters for audit
              </span>
              <Link to="/consent" className="text-[#125b63] hover:underline font-semibold">
                Manage Ingestion Consent
              </Link>
            </div>
          </div>
        </div>

        {/* Embedded Palette Bar Preview */}
        <PaletteBar showLabels={true} />

        {/* Readiness Checklist Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#fd5800]" />
                Algorithmic Matching Readiness
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete all requirements to pass the referral fairness gate
              </p>
            </div>
            <span className="text-xs font-bold text-[#125b63] bg-[#125b63]/10 px-3 py-1 rounded-full">
              {completionPercentage}% Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
                  item.done ? 'bg-[#238480]/5 border-[#238480]/30' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done ? 'bg-[#238480] text-white font-bold' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">{item.label}</span>
                </div>
                {!item.done ? (
                  <Link to={item.link} className="text-[#fd5800] font-bold text-[11px] hover:underline self-end">
                    Complete &rarr;
                  </Link>
                ) : (
                  <span className="text-[#238480] font-bold text-[10px] self-end uppercase">Verified</span>
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
                <Building2 className="w-5 h-5 text-[#fd5800]" />
                Active Flash Referral Opportunities
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live opportunities posted by alumni from your institution and partner colleges
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIneligibilityInfoOpen(!ineligibilityInfoOpen)}
              className="text-xs font-semibold text-slate-500 hover:text-[#125b63] flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How eligibility works</span>
            </button>
          </div>

          {/* Ineligibility Explainer Box */}
          {ineligibilityInfoOpen && (
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-slate-900">Fairness Gate Transparency Policy:</p>
              <p>
                Under PRD Section 10 rules, candidates who do not match a referral slot are shown a generic status (e.g. <em>&ldquo;not eligible for this referral right now&rdquo;</em>). Exact internal thresholds, cooldown periods, or proprietary algorithmic weights are withheld to safeguard privacy and prevent system gaming.
              </p>
            </div>
          )}

          {referralsLoading ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-8 h-8 border-2 border-[#125b63] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Loading open referral slots...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-base font-bold text-slate-900">No active flash referrals</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Alumni post flash referrals periodically. Check back often or ensure your Code-DNA profile is up to date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {referrals.map((ref) => (
                <div key={ref.id} className="relative">
                  <ReferralCard referral={ref} />
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

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white mt-12">
        SkillBridge Student Center &bull; Telemetry based on transparent evidence review
      </footer>
    </div>
  );
};

export default StudentDashboard;
