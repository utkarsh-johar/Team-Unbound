import React, { useState } from 'react';
import { Award, TrendingUp, TrendingDown, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { AlumniCredibility, Appeal } from '../types';
import AppealForm from './AppealForm';
import api from '../lib/api';

interface CredibilityScoreProps {
  credibility: AlumniCredibility;
  onRefresh?: () => void;
}

export const CredibilityScore: React.FC<CredibilityScoreProps> = ({ credibility, onRefresh }) => {
  const [activeAppealId, setActiveAppealId] = useState<string | null>(null);
  const [appealsMap, setAppealsMap] = useState<Record<string, Appeal>>({});

  const score = credibility.score ?? 100;
  const history = credibility.history ?? [];

  const handleAppealSubmit = async (historyId: string, reason: string) => {
    try {
      const response = await api.post('/appeals', {
        credibilityHistoryId: historyId,
        reason,
      });
      const appeal: Appeal = response.data.appeal || response.data;
      setAppealsMap((prev) => ({ ...prev, [historyId]: appeal }));
      setActiveAppealId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      throw err;
    }
  };

  const getScoreStatus = (val: number) => {
    if (val >= 115) return { label: 'Top Tier Alumnus', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (val >= 100) return { label: 'In Good Standing', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (val >= 80) return { label: 'Standard Standing', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Under Review', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const status = getScoreStatus(score);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header & Current Score Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Alumni Credibility Score</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            Reputation score based on candidate quality and referral screening outcomes. Transparent and strictly firewalled from student ranking.
          </p>
        </div>

        {/* Large Score Metric */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="text-right">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{score}</span>
            <span className="text-xs text-slate-400 font-medium block">/ 100 base</span>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${status.bg} ${status.color}`}>
            {status.label}
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Score Adjustment Timeline
        </h4>

        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Sparkles className="w-7 h-7 mx-auto text-slate-300 mb-1" />
            <p className="text-xs font-semibold text-slate-600">Initial Baseline Score Assigned</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Every alumnus starts at 100 points. Verified referrals award +15 points; failed candidate screenings deduct -20 points.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {history.map((entry) => {
              const isPositive = entry.changeAmount > 0;
              const isAppealing = activeAppealId === entry.id;
              const appeal = appealsMap[entry.id] || (entry.hasAppealed ? ({
                id: entry.appealId || '',
                submittedBy: entry.alumnusId,
                reason: 'Appeal previously submitted.',
                status: 'pending',
                createdAt: entry.createdAt,
              } as Appeal) : null);

              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-sm ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? `+${entry.changeAmount}` : entry.changeAmount} pts
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            {entry.reason}
                          </span>
                        </div>
                        {entry.referralTitle && (
                          <p className="text-xs text-indigo-600 mt-0.5">
                            Referral: {entry.referralTitle}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(entry.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Score Before -> After & Appeal button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                      <span className="text-xs text-slate-500 font-mono">
                        {entry.previousScore} &rarr; <strong>{entry.newScore}</strong>
                      </span>

                      {!isPositive && (
                        <div>
                          {appeal ? (
                            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-md">
                              Appeal Filed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveAppealId(isAppealing ? null : entry.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              {isAppealing ? 'Close Appeal' : 'Appeal Penalty'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show Appeal Form or Existing Appeal Details */}
                  {isAppealing && !appeal && (
                    <div className="pt-2 border-t border-slate-200">
                      <AppealForm
                        credibilityHistoryId={entry.id}
                        onSubmit={(reason) => handleAppealSubmit(entry.id, reason)}
                        onCancel={() => setActiveAppealId(null)}
                      />
                    </div>
                  )}

                  {appeal && !isAppealing && (
                    <div className="pt-2 border-t border-slate-200">
                      <AppealForm
                        existingAppeal={appeal}
                        onSubmit={async () => {}}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CredibilityScore;
