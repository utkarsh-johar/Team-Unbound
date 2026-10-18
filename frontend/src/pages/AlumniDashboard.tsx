import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Building,
  CheckCircle2,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { Referral, AlumniCredibility } from '../types';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';
import CredibilityScore from '../components/CredibilityScore';
import CandidateRankList from '../components/CandidateRankList';
import DemoBadge from '../components/DemoBadge';

export const AlumniDashboard: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [credibility, setCredibility] = useState<AlumniCredibility>({
    alumnusId: user?.id || '',
    score: 100,
    history: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedReferralId, setExpandedReferralId] = useState<string | null>(null);

  const fetchAlumniData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/alumni/dashboard');
      const refs = Array.isArray(res.data) ? res.data : res.data.referrals || [];
      setReferrals(refs);

      if (refs.length > 0 && !expandedReferralId) {
        setExpandedReferralId(refs[0].id);
      }

      if (res.data && res.data.credibility) {
        setCredibility({
          alumnusId: user?.id || '',
          score: res.data.credibility.score ?? 100,
          history: res.data.credibility.history || [],
        });
      }
    } catch {
      // Fallback if not loaded
    } finally {
      setLoading(false);
    }
  }, [expandedReferralId, user?.id]);

  useEffect(() => {
    fetchAlumniData();
  }, [fetchAlumniData]);

  const handleSelectCandidate = async (referralId: string, candidateId: string) => {
    await api.post(`/referrals/${referralId}/select`, { candidateId });
    await fetchAlumniData();
  };

  // Metric stats
  const totalSlots = referrals.reduce((acc, r) => acc + r.slots, 0);
  const totalReferred = referrals.reduce(
    (acc, r) =>
      acc + (r.candidates ? r.candidates.filter((c) => c.status === 'referred' || c.status === 'selected').length : 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DisclaimerBanner
          message="Sponsor Integrity Policy: Verified referrals reward +15 credibility; failed candidate screenings deduct -20 credibility points."
          variant="info"
        />
        {/* Verification Check & Top Action */}
        {!user?.isVerified ? (
          <div className="p-4 sm:p-5 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm">Account Verification In Progress</h3>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Your alumni credentials are under review by university administrators. Once approved, you will be able to publish new flash referral opportunities.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-200/80 text-amber-900 text-xs font-bold rounded-lg whitespace-nowrap self-start sm:self-auto">
              Verification Pending
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#125b63]">
                  Alumni Sponsor Workspace
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Alumnus
                </span>
                {user?.isDemo && <DemoBadge />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#151717] tracking-tight mt-1">
                Welcome back, {user?.name || 'Alumnus'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your flash referral slots, review ranked candidate shortlists, and track your transparent credibility.
              </p>
            </div>

            <Link
              to="/referrals/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fd5800] hover:bg-[#e04e00] text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Flash Referral</span>
            </Link>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referrals Published</p>
              <h3 className="text-2xl font-black text-[#151717] mt-1">{referrals.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{totalSlots} total candidate slots</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#125b63]/10 text-[#125b63] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidates Sponsored</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalReferred}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Selected from ranked shortlists</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credibility Rating</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{credibility.score}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Firewalled from candidate scoring</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Credibility Score & History Component */}
        <CredibilityScore credibility={credibility} onRefresh={fetchAlumniData} />

        {/* Referrals Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#151717] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#125b63]" />
                Your Flash Referrals & Ranked Candidates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review automated top-five ranked candidates, evaluate CodeDNA match evidence, and make your final referral selections.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold">Loading your referrals...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">No Referrals Posted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Help ambitious students from your college by posting a 7-day flash referral slot for open roles at your organization.
              </p>
              {user?.isVerified && (
                <div className="pt-2">
                  <Link
                    to="/referrals/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fd5800] hover:bg-[#e04e00] text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create First Referral
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {referrals.map((referral) => {
                const isExpanded = expandedReferralId === referral.id;
                const isExpired = new Date(referral.expiresAt).getTime() < Date.now();

                return (
                  <div
                    key={referral.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Header bar of Referral */}
                    <div
                      onClick={() => setExpandedReferralId(isExpanded ? null : referral.id)}
                      className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#125b63]/10 border border-[#125b63]/20 text-[#125b63] flex items-center justify-center flex-shrink-0">
                          <Building className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              {referral.company}
                            </span>
                            {referral.isDemo && <DemoBadge />}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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

                          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                            {referral.roleTitle}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Expires: {new Date(referral.expiresAt).toLocaleDateString()}
                            </span>
                            <span>&bull;</span>
                            <span>
                              <strong>{referral.slotsRemaining}</strong> of {referral.slots} slots available
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        <Link
                          to={`/referrals/${referral.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 text-xs font-bold text-[#125b63] hover:text-[#063f4a] bg-[#125b63]/10 hover:bg-[#125b63]/20 rounded-lg transition-colors"
                        >
                          Manage Referral
                        </Link>
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Ranked Candidates List */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
                        <CandidateRankList
                          candidates={referral.candidates || []}
                          slotsRemaining={referral.slotsRemaining}
                          isOpen={referral.status === 'open' && !isExpired}
                          onSelectCandidate={(candId) => handleSelectCandidate(referral.id, candId)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white mt-12">
        SkillBridge Alumni Portal &bull; Final referral choices remain under alumni discretion
      </footer>
    </div>
  );
};

export default AlumniDashboard;
