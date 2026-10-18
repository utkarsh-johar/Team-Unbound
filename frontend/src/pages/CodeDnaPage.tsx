import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Calendar, ArrowLeft, CheckCircle2, Briefcase, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useGitHub } from '../hooks/useGitHub';
import Navbar from '../components/Navbar';
import SkillGraph from '../components/SkillGraph';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const CodeDnaPage: React.FC = () => {
  const { codeDna, fetchCodeDna } = useProfile();
  const { sync, isConnected } = useGitHub();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCodeDna();
  }, [fetchCodeDna]);

  const handleSyncAndRefresh = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      await sync();
      await fetchCodeDna();
      setSyncMsg('Code-DNA evidence recalculated from GitHub sync.');
      setTimeout(() => setSyncMsg(null), 4000);
    } catch {
      // Handled
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#125b63] mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#125b63]">
                  Telemetry Profiling
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#125b63]/10 text-[#125b63] rounded-full border border-[#125b63]/20">
                  Deterministic Scoring
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#151717] tracking-tight mt-1">
                Your Code-DNA Skill Graph
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Last Computed:{' '}
                  <strong>
                    {codeDna?.lastComputedAt
                      ? new Date(codeDna.lastComputedAt).toLocaleString()
                      : 'Recently updated'}
                  </strong>
                </span>
              </p>
            </div>

            {/* Re-Sync Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={syncing || !isConnected}
                onClick={handleSyncAndRefresh}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fd5800] hover:bg-[#e04e00] text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Recalculating Scores...' : 'Re-sync & Recalculate'}</span>
              </button>
            </div>
          </div>
        </div>

        {syncMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{syncMsg}</span>
          </div>
        )}

        {/* Mandatory PRD Disclaimer */}
        <DisclaimerBanner
          message="Activity data is evidence for review, not proof of authorship or AI use."
          variant="info"
        />

        {/* SkillGraph with Evidence */}
        <SkillGraph
          scores={codeDna?.scores || []}
          title="Evaluated Technology Skill Scores (0–100)"
          subtitle="Score distribution derived from commit density, language volume, and framework manifests"
          showDisclaimer={false}
        />

        {/* Real-world Industry Experience & Internships Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#125b63]" />
                Industry Experience & Real-world Internships
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical experience increases your referral placement ranking and fit scores
              </p>
            </div>
            {(codeDna?.experienceSummary?.bonus ?? 0) > 0 ? (
              <span className="self-start sm:self-auto px-3 py-1 text-xs font-bold bg-[#fd5800]/10 text-[#fd5800] rounded-full border border-[#fd5800]/25 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                +{codeDna?.experienceSummary?.bonus} pts Experience Boost Active
              </span>
            ) : (
              <Link
                to="/profile"
                className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold text-[#125b63] bg-[#125b63]/10 hover:bg-[#125b63]/20 rounded-xl transition"
              >
                + Add Internship to Profile
              </Link>
            )}
          </div>

          {codeDna?.experience && codeDna.experience.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {codeDna.experience.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-[#125b63]/40 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {exp.role} <span className="text-slate-400 font-normal">&bull;</span> <span className="text-[#125b63]">{exp.company}</span>
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {exp.durationMonths} months duration
                      </span>
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                  )}

                  {exp.verificationLink && (
                    <a
                      href={exp.verificationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#125b63] hover:underline pt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Artifact / PR / Repo Evidence
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500">
                No internships recorded yet. Add your past software engineering experience in your Profile to earn Fit Score increments.
              </p>
            </div>
          )}
        </div>

        {/* In-Depth Explanation Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#125b63]" />
            How SkillBridge Formulates Your Code-DNA
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike resume keyword scrapers, SkillBridge computes Technology Skill Scores deterministically from your authenticated GitHub telemetry. We look at repository language breakdowns, commit velocity, consistency over time, and usage of production libraries (e.g. React, PostgreSQL, Docker, TensorFlow).
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Need to add or modify indexed repositories?</span>
            <Link to="/github/connect" className="text-[#125b63] font-bold hover:underline">
              Manage GitHub Ingestion &rarr;
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge Code-DNA &bull; Inspectable evidence over unverified claims
      </footer>
    </div>
  );
};

export default CodeDnaPage;
