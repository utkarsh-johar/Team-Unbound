import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { RecruiterInvite } from '../types';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const RecruiterInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [invite, setInvite] = useState<RecruiterInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/recruiter/invite/${token}`);
        setInvite(response.data.invite || response.data);
      } catch (err: unknown) {
        setError('This recruiter invitation token is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!token) return;
    setAccepting(true);
    setError(null);
    try {
      await api.post(`/recruiter/invite/${token}/accept`);
      navigate('/dashboard/recruiter');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to accept invitation.';
      setError(msg);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <DisclaimerBanner
          message="Hiring Partner Verification: Accepting this invitation grants you access to review verified candidate Code-DNA portfolios and confirm screening outcomes."
          variant="info"
        />

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Sparkles className="w-8 h-8 animate-spin mx-auto text-[#125b63] mb-2" />
            <p className="text-sm font-semibold">Validating recruiter invitation token...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Invitation Invalid or Expired</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">{error}</p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#125b63]/10 border border-[#125b63]/20 text-[#125b63] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Building2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#151717] tracking-tight">
                Recruiter Referral Invitation
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                You have been invited to review candidate telemetry for a flash referral.
              </p>
            </div>

            {/* Opportunity Details Box */}
            {invite?.referral && (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {invite.referral.company}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Active Slot
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{invite.referral.roleTitle}</h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {invite.referral.description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {invite.referral.requiredTechnologies.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Authentication Guard */}
            {!user ? (
              <div className="p-6 bg-[#125b63]/5 rounded-2xl border border-[#125b63]/20 text-center space-y-4">
                <ShieldCheck className="w-8 h-8 text-[#125b63] mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sign in to Claim Invitation</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Please sign in with your corporate or personal Google account to link this referral to your recruiter portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={login}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#fd5800] hover:bg-[#e04e00] text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <span>Sign In with Google</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  Signed in as <strong>{user.email}</strong>. Accepting this invite will activate your recruiter dashboard permissions.
                </div>

                <button
                  type="button"
                  disabled={accepting}
                  onClick={handleAcceptInvite}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#fd5800] hover:bg-[#e04e00] text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {accepting ? (
                    <span>Activating Access...</span>
                  ) : (
                    <>
                      <span>Accept Recruiter Invitation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge Recruiter Gateway &bull; One-click candidate verification
      </footer>
    </div>
  );
};

export default RecruiterInvitePage;
