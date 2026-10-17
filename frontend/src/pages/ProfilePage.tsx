import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import Navbar from '../components/Navbar';
import ProfileForm from '../components/ProfileForm';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DemoBadge from '../components/DemoBadge';
import { ShieldCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold text-xl flex items-center justify-center">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                {user?.isDemo && <DemoBadge />}
                <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              {user?.institution && (
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                  {user.institution.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Identity
            </span>
          </div>
        </div>

        <DisclaimerBanner
          message="Academic Verification Notice: CGPA is self-reported in MVP and contributes to Fit score normalization. Do not falsify grades; proof may be requested during alumni or recruiter review."
          variant="warning"
        />

        {/* Profile Editing Form */}
        <ProfileForm
          initialProfile={profile}
          onSave={async (data) => {
            await updateProfile(data);
          }}
        />
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge User Profile &bull; Configured for academic and referral matching
      </footer>
    </div>
  );
};

export default ProfilePage;
