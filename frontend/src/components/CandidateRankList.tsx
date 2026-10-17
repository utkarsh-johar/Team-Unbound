import React, { useState } from 'react';
import { Trophy, CheckCircle2, AlertTriangle, Sparkles, User, Info } from 'lucide-react';
import { ReferralCandidate } from '../types';

interface CandidateRankListProps {
  candidates: ReferralCandidate[];
  onSelectCandidate?: (candidateId: string) => Promise<void>;
  slotsRemaining: number;
  isOpen: boolean;
}

export const CandidateRankList: React.FC<CandidateRankListProps> = ({
  candidates = [],
  onSelectCandidate,
  slotsRemaining,
  isOpen,
}) => {
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleSelect = async (candidateId: string) => {
    if (!onSelectCandidate) return;
    try {
      setSelectingId(candidateId);
      await onSelectCandidate(candidateId);
    } finally {
      setSelectingId(null);
    }
  };

  const getStatusBadge = (status: ReferralCandidate['status']) => {
    switch (status) {
      case 'referred':
      case 'selected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Referred
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            Skipped
          </span>
        );
      case 'ranked':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            Ranked Shortlist
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Ranked Top Five Candidates
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked deterministically by: <strong>0.45 &times; CodeDNA</strong> + <strong>0.35 &times; Sandbox</strong> + <strong>0.20 &times; Fit</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
            {slotsRemaining} referral slot{slotsRemaining === 1 ? '' : 's'} available
          </span>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <Sparkles className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No candidates ranked yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Eligible candidates are processed via the Fairness Gate (outside cooldown, matching skills, and opted in).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((cand) => {
            const isSelected = cand.status === 'referred' || cand.status === 'selected';
            const canSelect = isOpen && slotsRemaining > 0 && !isSelected && onSelectCandidate;

            return (
              <div
                key={cand.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-indigo-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Rank & Candidate Info */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                        cand.rank === 1
                          ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300'
                          : cand.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : cand.rank === 3
                          ? 'bg-amber-700/10 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{cand.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <h4 className="font-bold text-slate-900 text-base">
                          {cand.candidate?.name || (cand as any).user?.name || `Candidate ${cand.candidateId.slice(0, 6)}`}
                        </h4>
                        {getStatusBadge(cand.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cand.candidate?.profile?.branch ||
                          (cand as any).profile?.branchProgram ||
                          cand.candidate?.profile?.branchProgram ||
                          'Computer Science & Engineering'}{' '}
                        &bull; Class of{' '}
                        {cand.candidate?.profile?.graduationYear ||
                          (cand as any).profile?.graduationYear ||
                          '2026'}
                      </p>
                    </div>
                  </div>

                  {/* Overall Match Score */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-600">
                        {Math.round(cand.matchScore)}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Total Match
                      </span>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isSelected ? (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Selected
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canSelect || selectingId === cand.candidateId}
                          onClick={() => handleSelect(cand.candidateId)}
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
                            canSelect
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {selectingId === cand.candidateId ? 'Submitting...' : 'Refer Candidate'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* CodeDNA Score */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700">CodeDNA (45%)</span>
                      <strong className="text-slate-900">{Math.round(cand.codeDnaScore)}/100</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${cand.codeDnaScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Sandbox Score (Placeholder Notice) */}
                  <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200/60">
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span className="font-semibold text-amber-900 flex items-center gap-1" title="Phase 2 Sandbox task">
                        Sandbox (35%)
                        <Info className="w-3 h-3 text-amber-600" />
                      </span>
                      <strong className="text-amber-900">{cand.sandboxScore || 50}/100</strong>
                    </div>
                    <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${cand.sandboxScore || 50}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-amber-700 mt-1 font-medium">
                      Placeholder — not yet measured
                    </p>
                  </div>

                  {/* Fit Score */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700">Fit (20%)</span>
                      <strong className="text-slate-900">{Math.round(cand.fitScore)}/100</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${cand.fitScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Academic & intent alignment</p>
                  </div>
                </div>

                {cand.skippedReason && (
                  <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Skip Reason: {cand.skippedReason}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateRankList;
