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
import PaletteBar from '../components/PaletteBar';

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
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PaletteBar />

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#065861] via-[#125b63] to-[#151717] p-6 sm:p-8 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Opportunities
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-white/10 text-white border border-white/20 rounded-full capitalize">
                {user?.role} View
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {isAlumni ? 'Your Posted Flash Referrals' : 'Active Flash Referrals'}
            </h1>
            <p className="text-xs text-teal-100 mt-1 max-w-xl leading-relaxed">
              {isAlumni
                ? 'Manage active slots, review candidate rankings, and generate invite links for hiring teams.'
                : 'Browse verified alumni referral opportunities. Matching is determined by Code-DNA and Fit.'}
            </p>
          </div>

          {isAlumni && user?.isVerified && (
            <Link
              to="/referrals/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#fd5800] hover:bg-[#e04e00] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, role title, or technology tag..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#125b63] bg-white text-[#151717] placeholder-slate-400 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold shadow-sm">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[#125b63] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-[#125b63]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('open')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'open'
                    ? 'bg-[#125b63] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-[#125b63]'
                }`}
              >
                Open Slots
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'expired'
                    ? 'bg-[#125b63] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-[#125b63]'
                }`}
              >
                Expired
              </button>
            </div>
          </div>
        </div>

        {/* Referrals Grid */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 border-2 border-[#125b63] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading referral opportunities...</p>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-sm">
            <Briefcase className="w-12 h-12 mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-[#151717]">No Referrals Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        SkillBridge Referral Directory &bull; Short-lived flash slots
      </footer>
    </div>
  );
};

export default ReferralsPage;
