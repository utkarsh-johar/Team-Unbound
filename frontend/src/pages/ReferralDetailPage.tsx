import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Clock,
  Users,
  Globe2,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Award,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useReferrals } from '../hooks/useReferrals';
import Navbar from '../components/Navbar';
import CandidateRankList from '../components/CandidateRankList';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DemoBadge from '../components/DemoBadge';
import { Referral } from '../types';

export const ReferralDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getReferralDetail, selectCandidate, generateInvite } = useReferrals();

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReferralDetail(id);
      setReferral(data);
    } catch (err: unknown) {
      console.error('Error loading referral detail:', err);
      setError('Could not retrieve this referral opportunity. Please ensure you are logged in and the referral ID is valid.');
    } finally {
      setLoading(false);
    }
  }, [id, getReferralDetail]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleGenerateInvite = async () => {
    if (!id) return;
    try {
      const res = await generateInvite(id);
      const fullUrl = res.inviteUrl && res.inviteUrl.startsWith('http')
        ? res.inviteUrl
        : `${window.location.origin}${res.inviteUrl || `/recruiter/invite/${res.token}`}`;
      setInviteUrl(fullUrl);
    } catch {
      setError('Failed to create recruiter invitation link.');
    }
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSelectCandidate = async (candidateId: string) => {
    if (!id) return;
    await selectCandidate(id, candidateId);
    await fetchDetail();
  };

  const isAuthorAlumni = user?.id === referral?.alumnusId || user?.role === 'alumni' || user?.role === 'admin';
  const isExpired = referral
    ? new Date(referral.expiresAt).getTime() < Date.now() || referral.status === 'expired'
    : false;

  const rawTechs = referral?.requiredTechnologies;
  const techList: string[] = Array.isArray(rawTechs)
    ? rawTechs
    : typeof rawTechs === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(rawTechs);
          return Array.isArray(parsed) ? parsed : [rawTechs];
        } catch {
          return (rawTechs as string).split(',').map((t) => t.trim());
        }
      })()
    : [];

  const slotsRemaining = referral?.slotsRemaining !== undefined
    ? referral.slotsRemaining
    : referral?.slots || 1;

  return (
    <div className="min-h-screen bg-[#071519] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DisclaimerBanner
          message="Sponsoring Policy: Final candidate decisions remain with the sponsoring alumnus. Recruiter confirmations affect alumni credibility."
          variant="info"
        />

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-200 text-xs font-semibold rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <Link
            to="/referrals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Referrals Directory</span>
          </Link>

          {loading ? (
            <div className="py-20 text-center bg-[#0a1f24] rounded-3xl border border-teal-900/50 shadow-xl space-y-3">
              <div className="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-400">Loading opportunity details...</p>
            </div>
          ) : !referral ? (
            <div className="p-12 text-center bg-[#0a1f24] rounded-3xl border border-teal-900/50 shadow-xl space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-200">Referral opportunity not found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                This referral may have expired, been withdrawn, or the URL identifier is invalid.
              </p>
              <Link
                to="/referrals"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Browse All Open Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Main Referral Info Card */}
              <div className="bg-[#0a1f24] rounded-3xl border border-teal-900/60 shadow-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-teal-900/40 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-950/80 border border-teal-700/50 text-brand-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {referral.company}
                        </span>
                        {referral.isDemo && <DemoBadge />}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isExpired
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                              : referral.status === 'open'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isExpired ? 'EXPIRED' : referral.status.toUpperCase()}
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
                        {referral.roleTitle}
                      </h1>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>Sponsor:</span>
                        <strong className="text-slate-200">{referral.alumnus?.name || 'Verified Alumnus'}</strong>
                        {referral.alumnus?.email && (
                          <span className="text-slate-500">&bull; {referral.alumnus.email}</span>
                        )}
                        {referral.institution?.name && (
                          <span className="text-teal-400">&bull; {referral.institution.name}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Recruiter Invite Generation for Alumni */}
                  {isAuthorAlumni && (
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateInvite}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-copper-600 hover:bg-copper-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-copper-900/40 transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Generate Recruiter Invite Link</span>
                      </button>

                      {inviteUrl && (
                        <div className="flex items-center gap-2 p-2 bg-[#061013] border border-teal-900/60 rounded-xl text-xs max-w-sm">
                          <input
                            type="text"
                            readOnly
                            value={inviteUrl}
                            className="bg-transparent text-slate-300 font-mono text-[11px] truncate flex-1 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1.5 text-brand-400 hover:text-brand-300 rounded-lg hover:bg-teal-900/40"
                            title="Copy link"
                          >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 bg-[#061013]/70 p-4 rounded-2xl border border-teal-900/40">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-brand-400" />
                    <span>
                      Slots Remaining: <strong className="text-white font-bold">{slotsRemaining}</strong> of {referral.slots}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-copper-400" />
                    <span>
                      Expiry Date: <strong className="text-white font-bold">{new Date(referral.expiresAt).toLocaleDateString()}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      Cross-College: <strong className="text-white font-bold">{referral.openToOtherColleges ? 'Partner colleges included' : 'Home campus only'}</strong>
                    </span>
                  </div>
                </div>

                {/* Required Technologies */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400/80 mb-2.5">
                    Evaluated Skill Prerequisites
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {techList.length > 0 ? (
                      techList.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-teal-950/80 border border-teal-800/60 text-brand-300 text-xs font-bold rounded-xl shadow-sm"
                        >
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">General software engineering skills evaluated</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400/80 mb-2.5">
                    Role Description & Requirements
                  </h4>
                  <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-[#061013]/60 p-5 rounded-2xl border border-teal-900/40">
                    {referral.description}
                  </div>
                </div>
              </div>

              {/* Student Candidate Standing Section (when student views) */}
              {user?.role === 'student' && (
                <div className="bg-[#0a1f24] rounded-3xl border border-teal-800/50 p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between border-b border-teal-900/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-copper-950/80 border border-copper-700/50 text-copper-400 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">Your Candidate Evaluation Standing</h3>
                        <p className="text-xs text-slate-400">Automated match against evaluated Code-DNA and fit criteria</p>
                      </div>
                    </div>

                    {referral.myMatch ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        referral.myMatch.status === 'referred'
                          ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                          : 'bg-teal-950 border border-teal-700 text-brand-300'
                      }`}>
                        {referral.myMatch.status === 'referred' ? 'SELECTED & REFERRED' : `Rank #${referral.myMatch.rank}`}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        In Evaluation Pool
                      </span>
                    )}
                  </div>

                  {referral.myMatch ? (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-[#061013] rounded-2xl border border-teal-900/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Match Score</p>
                        <p className="text-2xl font-black text-brand-400 mt-1">{referral.myMatch.matchScore}%</p>
                      </div>
                      <div className="p-4 bg-[#061013] rounded-2xl border border-teal-900/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Code-DNA Score</p>
                        <p className="text-2xl font-black text-slate-100 mt-1">{referral.myMatch.codeDnaScore} / 100</p>
                        <p className="text-[10px] text-slate-500">Weight: 45%</p>
                      </div>
                      <div className="p-4 bg-[#061013] rounded-2xl border border-teal-900/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sandbox Baseline</p>
                        <p className="text-2xl font-black text-slate-100 mt-1">{referral.myMatch.sandboxScore} / 100</p>
                        <p className="text-[10px] text-slate-500">Phase 1 Placeholder (35%)</p>
                      </div>
                      <div className="p-4 bg-[#061013] rounded-2xl border border-teal-900/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Academic & Fit</p>
                        <p className="text-2xl font-black text-slate-100 mt-1">{referral.myMatch.fitScore} / 100</p>
                        <p className="text-[10px] text-slate-500">Degree & Year (20%)</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your GitHub public evidence and academic standing have been processed. Candidates are dynamically ranked based on commit evidence in <strong className="text-slate-200">{techList.join(', ') || 'required skills'}</strong>.
                    </p>
                  )}
                </div>
              )}

              {/* Match Scoring Formula Card */}
              <div className="bg-[#0a1f24]/80 rounded-3xl border border-teal-900/50 p-6 space-y-3">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span>Fairness Gate Ranking Formula (PRD Section 6.6)</span>
                </div>
                <p className="text-xs text-brand-300 font-mono bg-[#061013] p-3.5 rounded-xl border border-teal-900/60">
                  Match Score = (0.45 &times; CodeDNA) + (0.35 &times; Sandbox Baseline) + (0.20 &times; Profile Fit)
                </p>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>&bull; <strong className="text-slate-200">CodeDNA (45%):</strong> Evaluated based on repository commit history, volume, and library evidence.</p>
                  <p>&bull; <strong className="text-slate-200">Sandbox (35%):</strong> Fixed baseline value (50/100) for Phase 1 MVP until Phase 2 interactive debugger launches.</p>
                  <p>&bull; <strong className="text-slate-200">Fit (20%):</strong> Academic graduation year, branch relevance, and career domain intent.</p>
                </div>
              </div>

              {/* CandidateRankList (Visible to Alumni & Reviewers) */}
              {isAuthorAlumni && (
                <div className="bg-[#0a1f24] rounded-3xl border border-teal-900/60 p-6 sm:p-8 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-lg font-extrabold text-white">Ranked Candidate Pool (Top 5)</h3>
                    <p className="text-xs text-slate-400">
                      Sponsor has final authority to select candidates for referral delivery.
                    </p>
                  </div>
                  <CandidateRankList
                    candidates={referral.candidates || []}
                    slotsRemaining={slotsRemaining}
                    isOpen={referral.status === 'open' && !isExpired}
                    onSelectCandidate={handleSelectCandidate}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-teal-900/40 bg-[#061013]">
        SkillBridge Referral Oversight &bull; Transparent ranking with human decision authority
      </footer>
    </div>
  );
};

export default ReferralDetailPage;
