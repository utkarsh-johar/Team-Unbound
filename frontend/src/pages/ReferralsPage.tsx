import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  PlusCircle,
  Filter,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useReferrals } from '../hooks/useReferrals';
import Navbar from '../components/Navbar';
import ReferralCard from '../components/ReferralCard';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const { referrals, fetchReferrals, loading } = useReferrals();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'expired'>('all');

  const isAlumni = user?.role === 'alumni';

  useEffect(() => {
    if (isAlumni) {
      fetchReferrals({ mine: true });
    } else {
      fetchReferrals({ status: statusFilter === 'all' ? undefined : statusFilter });
    }
  }, [fetchReferrals, isAlumni, statusFilter]);

  const filteredReferrals = referrals.filter((ref) => {
    const techs = Array.isArray(ref.requiredTechnologies)
      ? ref.requiredTechnologies
      : typeof ref.requiredTechnologies === 'string'
      ? (ref.requiredTechnologies as string).split(',')
      : [];

    const matchesSearch =
      ref.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      techs.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const isExpired = new Date(ref.expiresAt).getTime() < Date.now() || ref.status === 'expired';

    if (statusFilter === 'open') {
      return matchesSearch && !isExpired && ref.status === 'open';
    }
    if (statusFilter === 'expired') {
      return matchesSearch && (isExpired || ref.status === 'expired');
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#071519] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-[#0a1f24] p-6 sm:p-8 rounded-3xl border border-teal-900/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Opportunities
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-950 text-brand-300 border border-teal-800 rounded-full capitalize">
                {user?.role} View
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {isAlumni ? 'Your Posted Flash Referrals' : 'Active Flash Referrals'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              {isAlumni
                ? 'Manage active slots, review candidate rankings, and generate invite links for hiring teams.'
                : 'Browse verified alumni referral opportunities. Matching is determined by Code-DNA and Fit.'}
            </p>
          </div>

          {isAlumni && user?.isVerified && (
            <Link
              to="/referrals/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-copper-600 hover:bg-copper-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-copper-900/40 transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Referral</span>
            </Link>
          )}
        </div>

        <DisclaimerBanner
          message="Fairness Gate Notice: Students are evaluated deterministically. If you do not qualify for a referral, generic status is displayed to protect policy configurations."
          variant="info"
        />

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, role title, or technology tag..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-teal-900/70 focus:outline-none focus:border-brand-400 bg-[#061013] text-white placeholder-slate-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <div className="flex items-center bg-[#061013] border border-teal-900/70 rounded-xl p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-teal-900/80 text-brand-300 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('open')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'open'
                    ? 'bg-teal-900/80 text-brand-300 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Open Slots
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'expired'
                    ? 'bg-teal-900/80 text-brand-300 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expired
              </button>
            </div>
          </div>
        </div>

        {/* Referrals Grid */}
        {loading ? (
          <div className="py-20 text-center bg-[#0a1f24] rounded-3xl border border-teal-900/50 shadow-xl space-y-3">
            <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">Loading referral opportunities...</p>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="py-20 text-center bg-[#0a1f24] rounded-3xl border border-teal-900/50 p-8 space-y-3 shadow-xl">
            <Briefcase className="w-12 h-12 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-slate-200">No Referrals Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? 'Try broadening your search term or adjusting filter criteria.'
                : 'There are currently no referrals matching your filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReferrals.map((ref) => (
              <ReferralCard key={ref.id} referral={ref} />
            ))}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-teal-900/40 bg-[#061013]">
        SkillBridge Referral Directory &bull; Short-lived flash slots
      </footer>
    </div>
  );
};

export default ReferralsPage;
