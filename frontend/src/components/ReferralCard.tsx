import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Clock, Users, Globe2, ArrowRight } from 'lucide-react';
import { Referral } from '../types';
import DemoBadge from './DemoBadge';

interface ReferralCardProps {
  referral: Referral;
  showActions?: boolean;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ referral, showActions = true }) => {
  const isExpired = new Date(referral.expiresAt).getTime() < Date.now() || referral.status === 'expired';
  const remainingSlots = referral.slotsRemaining !== undefined ? referral.slotsRemaining : referral.slots;
  const isClosed = referral.status === 'closed' || remainingSlots <= 0;

  // Calculate human-friendly time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-950/60 text-rose-400 rounded-full border border-rose-800/60">
          Expired
        </span>
      );
    }
    if (isClosed) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-800 text-slate-400 rounded-full border border-slate-700">
          Closed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-950/80 text-emerald-400 rounded-full border border-emerald-800/60 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Open
      </span>
    );
  };

  const rawTechs = referral.requiredTechnologies;
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

  return (
    <div className="bg-[#0a1f24] rounded-3xl border border-teal-900/60 p-6 shadow-xl hover:border-brand-500/60 hover:shadow-2xl transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Company, Role, Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-950 border border-teal-800 text-brand-400 flex items-center justify-center flex-shrink-0 group-hover:bg-copper-600 group-hover:text-white transition-all shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {referral.company}
                </span>
                {referral.isDemo && <DemoBadge />}
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                {referral.roleTitle}
              </h4>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {referral.description}
        </p>

        {/* Required Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {techList.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs font-bold bg-[#061013] text-brand-300 rounded-xl border border-teal-900/80"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div>
        {/* Meta Bar: Slots & Expiry & College Policy */}
        <div className="pt-4 border-t border-teal-900/40 flex items-center justify-between text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-1.5" title="Available referral slots">
            <Users className="w-4 h-4 text-brand-400" />
            <span>
              <strong className="text-white">{remainingSlots}</strong> of {referral.slots} slots open
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="Time until auto-closure">
            <Clock className="w-4 h-4 text-copper-400" />
            <span className={isExpired ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
              {getTimeRemaining(referral.expiresAt)}
            </span>
          </div>
        </div>

        {/* College Accessibility Flag */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {referral.openToOtherColleges ? (
              <span className="text-brand-300 font-semibold">Open to partner colleges</span>
            ) : (
              <span className="text-slate-400">Home institution priority</span>
            )}
          </span>
        </div>

        {/* CTA Link */}
        {showActions && (
          <Link
            to={`/referrals/${referral.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#061013] hover:bg-copper-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-teal-900/80 hover:border-copper-500 shadow-md group-hover:shadow-lg"
          >
            <span>View Opportunity Details</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ReferralCard;
