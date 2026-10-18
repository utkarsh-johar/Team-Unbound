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
        <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-600 rounded-full border border-rose-200">
          Expired
        </span>
      );
    }
    if (isClosed) {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-500 rounded-full border border-slate-200">
          Closed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-[#238480] transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Company, Role, Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#063f4a]/10 border border-[#125b63]/20 text-[#125b63] flex items-center justify-center flex-shrink-0 group-hover:bg-[#fd5800] group-hover:text-white transition-all shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#125b63]">
                  {referral.company}
                </span>
                {referral.isDemo && <DemoBadge />}
              </div>
              <h4 className="text-base font-bold text-[#151717] group-hover:text-[#125b63] transition-colors">
                {referral.roleTitle}
              </h4>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {referral.description}
        </p>

        {/* Required Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {techList.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-50 text-[#125b63] rounded-lg border border-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div>
        {/* Meta Bar: Slots & Expiry & College Policy */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1.5" title="Available referral slots">
            <Users className="w-4 h-4 text-[#125b63]" />
            <span>
              <strong className="text-[#151717]">{remainingSlots}</strong> of {referral.slots} slots open
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="Time until auto-closure">
            <Clock className="w-4 h-4 text-[#ae5a34]" />
            <span className={isExpired ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
              {getTimeRemaining(referral.expiresAt)}
            </span>
          </div>
        </div>

        {/* College Accessibility Flag */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Globe2 className="w-3.5 h-3.5 text-[#238480]" />
          <span>
            {referral.openToOtherColleges ? (
              <span className="text-[#125b63] font-semibold">Open to partner colleges</span>
            ) : (
              <span className="text-slate-500">Home institution priority</span>
            )}
          </span>
        </div>

        {/* CTA Link */}
        {showActions && (
          <Link
            to={`/referrals/${referral.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#fd5800] hover:bg-[#e04e00] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md group-hover:translate-y-[-1px]"
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
