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
    try {
      const data = await getReferralDetail(id);
      setReferral(data);
    } catch (err: unknown) {
      setError('Failed to load referral details.');
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
      const fullUrl = res.inviteUrl.startsWith('http')
        ? res.inviteUrl
        : `${window.location.origin}${res.inviteUrl}`;
      setInviteUrl(fullUrl);
    } catch {
      setError('Failed to create recruiter invitation token.');
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
  const isExpired = referral ? new Date(referral.expiresAt).getTime() < Date.now() || referral.status === 'expired' : false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DisclaimerBanner
          message="Sponsoring Policy: Final candidate decisions remain with the sponsoring alumnus. Recruiter confirmations affect alumni credibility."
          variant="info"
        />

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <Link
            to="/referrals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Referrals Directory</span>
          </Link>

          {loading ? (
            <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold">Loading opportunity details...</p>
            </div>
          ) : !referral ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-rose-600 text-sm font-bold">
              Referral opportunity not found or has been withdrawn.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Main Referral Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {referral.company}
                        </span>
                        {referral.isDemo && <DemoBadge />}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isExpired
                              ? 'bg-rose-100 text-rose-700'
                              : referral.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isExpired ? 'Expired' : referral.status.toUpperCase()}
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                        {referral.roleTitle}
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        Posted by: <strong>{referral.alumnus?.name || 'Verified Alumnus'}</strong> &bull; Sponsor Email: {referral.alumnus?.email}
                      </p>
                    </div>
                  </div>

                  {/* Recruiter Invite Generation for Alumni */}
                  {isAuthorAlumni && (
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateInvite}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Generate Recruiter Invite Link</span>
                      </button>

                      {inviteUrl && (
                        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs max-w-sm">
                          <input
                            type="text"
                            readOnly
                            value={inviteUrl}
                            className="bg-transparent text-slate-600 font-mono text-[11px] truncate flex-1 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-slate-100"
                            title="Copy to clipboard"
                          >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>
                      Slots Remaining: <strong className="text-slate-900">{referral.slotsRemaining}</strong> of {referral.slots}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>
                      Expiry Date: <strong className="text-slate-900">{new Date(referral.expiresAt).toLocaleDateString()}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-indigo-600" />
                    <span>
                      Cross-College: <strong className="text-slate-900">{referral.openToOtherColleges ? 'Yes (Partner network)' : 'Home institution only'}</strong>
                    </span>
                  </div>
                </div>

                {/* Required Technologies */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Evaluated Skill Prerequisites:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {referral.requiredTechnologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg shadow-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Role Description & Requirements:
                  </h4>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                    {referral.description}
                  </p>
                </div>
              </div>

              {/* Match Scoring Formula Card */}
              <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-6 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Fairness Gate Ranking Formula (PRD Section 6.6)</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed font-mono bg-white/70 p-3 rounded-lg border border-indigo-200">
                  Match Score = (0.45 &times; CodeDNA) + (0.35 &times; Sandbox) + (0.20 &times; Fit)
                </p>
                <div className="text-[11px] text-indigo-700 space-y-1">
                  <p>&bull; <strong>CodeDNA (45%):</strong> Evaluated based on repository commit volume and library relevance.</p>
                  <p>&bull; <strong>Sandbox (35%):</strong> Fixed placeholder value (50/100) for Phase 1 MVP until Phase 2 interactive debugging simulator launches.</p>
                  <p>&bull; <strong>Fit (20%):</strong> Academic graduation year, degree branch, and career intent alignment.</p>
                </div>
              </div>

              {/* CandidateRankList (Visible to Alumni & Reviewers) */}
              {isAuthorAlumni && (
                <CandidateRankList
                  candidates={referral.candidates || []}
                  slotsRemaining={referral.slotsRemaining}
                  isOpen={referral.status === 'open' && !isExpired}
                  onSelectCandidate={handleSelectCandidate}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge Referral Oversight &bull; Transparent ranking with human decision authority
      </footer>
    </div>
  );
};

export default ReferralDetailPage;
