import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Building,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const RoleSelectPage: React.FC = () => {
  const { user, selectRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    {
      id: 'student',
      title: 'Current Student',
      icon: GraduationCap,
      color: 'from-[#063f4a] to-[#125b63]',
      badge: 'Requires College Email',
      description: 'Turn your GitHub activity into verifiable Code-DNA scores and earn flash referrals to top tech roles.',
      features: [
        'Automated GitHub skill evidence extraction',
        'Eligibility for alumni flash referrals',
        'Fairness gate cooldown & rotation protections',
      ],
    },
    {
      id: 'alumni',
      title: 'Alumnus / Sponsoring Engineer',
      icon: Briefcase,
      color: 'from-[#125b63] to-[#238480]',
      badge: 'Verified via Admin',
      description: 'Post flash referral slots for open roles at your company and sponsor top candidates from your alma mater.',
      features: [
        'Post 7-day flash referral opportunities',
        'Ranked top-five candidate shortlist view',
        'Reputation tracked via Alumni Credibility Score',
      ],
    },
    {
      id: 'recruiter',
      title: 'Recruiter / Hiring Partner',
      icon: Building,
      color: 'from-[#238480] to-[#34807f]',
      badge: 'Invite or Partner Access',
      description: 'Review structured candidate portfolios with raw code evidence and confirm screening outcomes.',
      features: [
        'Direct access to ranked candidate evidence',
        'Outcome confirmation workflow',
        'Eliminate cold outreach noise',
      ],
    },
    {
      id: 'founder',
      title: 'Early-Stage Founder',
      icon: Rocket,
      color: 'from-[#e04e00] to-[#fd5800]',
      badge: 'Phase 3 Preview',
      description: 'Engage skilled students for technical task pods, prototype feedback, and early engineering hires.',
      features: [
        'Task pod collaboration (Phase 3)',
        'Product feedback cycles',
        'Direct student talent pipeline',
      ],
    },
  ];

  const handleRoleSelection = async (roleId: string) => {
    setSelectedRole(roleId);
    setLoading(true);
    setError(null);
    try {
      await selectRole(roleId);
      navigate(`/dashboard/${roleId}`);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to assign role. Please try again.';
      setError(msg);
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <DisclaimerBanner
          message="Role assignment configures dashboard access and permission boundaries. Institutional email domains will be verified for student roles."
          variant="info"
        />

        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#125b63]/10 text-[#125b63] rounded-full text-xs font-bold uppercase tracking-wider border border-[#125b63]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Account Onboarding
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#151717] tracking-tight">
            Select Your Role in SkillBridge
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome, <strong>{user?.name || user?.email || 'Scholar'}</strong>! Please designate how you will be engaging with the SkillBridge ecosystem.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isProcessing = loading && selectedRole === role.id;

            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between group hover:border-[#125b63]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-[#fd5800] group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full">
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#151717] group-hover:text-[#125b63] transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="mt-5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Core Capabilities:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleRoleSelection(role.id)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#151717] group-hover:bg-[#fd5800] text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Assigning Role...</span>
                    ) : (
                      <>
                        <span>Continue as {role.title}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        SkillBridge Account Configuration &bull; Role permissions are enforceable by system guard middleware
      </footer>
    </div>
  );
};

export default RoleSelectPage;
