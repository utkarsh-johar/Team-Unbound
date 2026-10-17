import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  User,
  ShieldAlert,
  Send,
  Sparkles,
} from 'lucide-react';
import api from '../lib/api';
import { Referral } from '../types';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DemoBadge from '../components/DemoBadge';

const FAILED_REASONS = [
  'skills not matching evidence',
  'misrepresented evidence',
  'not meeting stated requirements',
];

export const RecruiterDashboard: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [outcomeTypes, setOutcomeTypes] = useState<Record<string, 'successful' | 'failed' | 'neutral'>>({});
  const [failedReasons, setFailedReasons] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchInvitedReferrals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/recruiter/referrals');
      const list = Array.isArray(response.data)
        ? response.data
        : response.data.referrals || [];
      setReferrals(list);
    } catch {
      // Fallback for demo or initial state
      try {
        const fallback = await api.get('/referrals');
        const list = Array.isArray(fallback.data) ? fallback.data : fallback.data.referrals || [];
        setReferrals(list);
      } catch {
        setReferrals([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitedReferrals();
  }, []);

  const handleOutcomeSubmit = async (referralId: string, candidateId: string) => {
    const key = `${referralId}-${candidateId}`;
    const outcome = outcomeTypes[key] || 'successful';
    const reason = failedReasons[key] || FAILED_REASONS[0];
    const recruiterNote = notes[key] || '';

    setSubmittingId(key);
    setStatusMessage(null);
    try {
      await api.post(`/recruiter/outcomes`, {
        referralId,
        candidateId,
        outcome,
        reason: outcome === 'failed' ? reason : undefined,
        note: recruiterNote,
      });

      setStatusMessage('Screening outcome successfully confirmed and logged to audit ledger.');
      await fetchInvitedReferrals();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to record candidate outcome.';
      setStatusMessage(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DisclaimerBanner
          message="Recruiter Workspace MVP: Candidate screening outcome confirmation is fully functional. Automated talent search and pipeline integration are coming in Phase 2."
          variant="info"
        />

        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Hiring Partner Portal
              </span>
              <DemoBadge />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Referral Outcome Review
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Confirm interview and screening outcomes for candidates referred by alumni. Your feedback maintains accountability and updates alumni credibility scores.
            </p>
          </div>

          <div className="p-3 bg-purple-50 text-purple-800 rounded-xl border border-purple-200 text-xs">
            <span className="font-bold block">Outcome Impact Policy:</span>
            <ul className="text-[11px] space-y-0.5 mt-0.5">
              <li>&bull; Successful: <strong>+15 Credibility</strong> to Alumnus</li>
              <li>&bull; Failed Screening: <strong>-20 Credibility</strong> (with appeal path)</li>
              <li>&bull; Neutral: <strong>No score change</strong></li>
            </ul>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Referrals & Candidates List */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Referred Candidate Inquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidates who were shortlisted and sponsored by verified alumni
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold">Loading invited referrals...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-base font-bold text-slate-800">No active referral inquiries</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                When an alumnus submits a flash referral candidate to your company, they will appear here for outcome confirmation.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {referrals.map((referral) => {
                // Find candidates that have status 'referred' or 'selected'
                const referredCandidates =
                  referral.candidates?.filter(
                    (c) => c.status === 'referred' || c.status === 'selected'
                  ) || [];

                return (
                  <div
                    key={referral.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* Referral Header */}
                    <div className="p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {referral.company}
                          </span>
                          {referral.isDemo && <DemoBadge />}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{referral.roleTitle}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sponsor: <strong>{referral.alumnus?.name || 'Verified Alumnus'}</strong> ({referral.alumnus?.email})
                        </p>
                      </div>

                      <div className="text-xs text-slate-500">
                        {referredCandidates.length} candidate(s) awaiting or evaluated
                      </div>
                    </div>

                    {/* Candidate Evaluation Rows */}
                    <div className="p-5 space-y-6">
                      {referredCandidates.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          The sponsoring alumnus has not finalized candidate selections for this slot yet.
                        </div>
                      ) : (
                        referredCandidates.map((cand) => {
                          const key = `${referral.id}-${cand.candidateId}`;
                          const selectedOutcome = outcomeTypes[key] || 'successful';
                          const isSubmitting = submittingId === key;

                          return (
                            <div
                              key={cand.id}
                              className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                      {cand.candidate?.name || `Candidate ${cand.candidateId.slice(0, 6)}`}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                      Total Match: <strong>{Math.round(cand.matchScore)}/100</strong> (CodeDNA: {cand.codeDnaScore}, Fit: {cand.fitScore})
                                    </p>
                                  </div>
                                </div>

                                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 self-start sm:self-auto">
                                  Sponsor Referral Submitted
                                </span>
                              </div>

                              {/* Form */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-2">
                                    Confirm Candidate Screening Outcome:
                                  </label>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setOutcomeTypes((prev) => ({ ...prev, [key]: 'successful' }))}
                                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-start gap-2.5 ${
                                        selectedOutcome === 'successful'
                                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                      }`}
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p>Successful Screening</p>
                                        <p className="text-[10px] text-emerald-700 font-normal mt-0.5">
                                          Passed technical screening (+15 alumni credibility)
                                        </p>
                                      </div>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setOutcomeTypes((prev) => ({ ...prev, [key]: 'failed' }))}
                                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-start gap-2.5 ${
                                        selectedOutcome === 'failed'
                                          ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-sm'
                                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                      }`}
                                    >
                                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p>Failed Screening</p>
                                        <p className="text-[10px] text-rose-700 font-normal mt-0.5">
                                          Inadequate skill evidence (-20 alumni credibility)
                                        </p>
                                      </div>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setOutcomeTypes((prev) => ({ ...prev, [key]: 'neutral' }))}
                                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-start gap-2.5 ${
                                        selectedOutcome === 'neutral'
                                          ? 'border-slate-500 bg-slate-100 text-slate-900 shadow-sm'
                                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                      }`}
                                    >
                                      <MinusCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p>Neutral / Headcount</p>
                                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                                          Late stage / budget change (no credibility delta)
                                        </p>
                                      </div>
                                    </button>
                                  </div>
                                </div>

                                {/* Conditional Reason Dropdown for Failed Screening */}
                                {selectedOutcome === 'failed' && (
                                  <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                                    <label className="block text-xs font-bold text-rose-900 flex items-center gap-1.5">
                                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                      Mandatory Screening Failure Reason:
                                    </label>
                                    <select
                                      value={failedReasons[key] || FAILED_REASONS[0]}
                                      onChange={(e) =>
                                        setFailedReasons((prev) => ({ ...prev, [key]: e.target.value }))
                                      }
                                      className="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-white text-slate-800 font-medium"
                                    >
                                      {FAILED_REASONS.map((r) => (
                                        <option key={r} value={r}>
                                          {r}
                                        </option>
                                      ))}
                                    </select>
                                    <p className="text-[10px] text-rose-700">
                                      Per PRD Section 7, failed screening deducts -20 points from the sponsoring alumnus. The alumnus receives an appeal option.
                                    </p>
                                  </div>
                                )}

                                {/* Recruiter Note */}
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Confidential Recruiter Note (Optional):
                                  </label>
                                  <input
                                    type="text"
                                    value={notes[key] || ''}
                                    onChange={(e) =>
                                      setNotes((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    placeholder="Add any contextual observations for the hiring audit log..."
                                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>

                                <div className="flex justify-end pt-2">
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleOutcomeSubmit(referral.id, cand.candidateId)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    {isSubmitting ? 'Recording Outcome...' : 'Submit Final Outcome'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coming Soon Teaser */}
        <div className="bg-slate-100 rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Advanced Recruiter Portal Coming in Phase 2</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Direct candidate sourcing, Shadow-Intern interactive debugging replays, and corporate bounty integration are actively under development.
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white mt-12">
        SkillBridge Recruiter Portal &bull; Evidence review over resume claims
      </footer>
    </div>
  );
};

export default RecruiterDashboard;
