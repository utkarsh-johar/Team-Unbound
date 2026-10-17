import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, School, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (!user.role) {
        navigate('/select-role');
      } else {
        navigate(`/dashboard/${user.role}`);
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6">
          {/* Concept Disclaimer */}
          <DisclaimerBanner
            message="Concept MVP: No real customers or production data exist. Use your institutional Google workspace email for automatic student verification."
            variant="info"
          />

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome to SkillBridge
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Sign in to manage your Code-DNA skill evidence and explore verified alumni flash referrals.
              </p>
            </div>

            {/* Google Sign-In Action */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={login}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl font-bold text-sm text-slate-700 shadow-sm hover:shadow transition-all group"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform ml-auto" />
              </button>
            </div>

            {/* Crucial Institutional Requirement Notes */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <School className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Students:</strong> Please use your college-issued Google account. The system validates your email domain against your university’s registry to automate enrollment verification.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Users className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Alumni & Recruiters:</strong> You may sign in using any standard Google account. Alumni accounts will be verified by administration, and recruiters are activated via direct referral invite tokens.
                </div>
              </div>
            </div>

            {/* Privacy and Least Privilege Assurance */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Least-privilege OAuth 2.0 &bull; SSL Encrypted</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} SkillBridge &bull; Confidential Concept Build
      </footer>
    </div>
  );
};

export default LoginPage;
