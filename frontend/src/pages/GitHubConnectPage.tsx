import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Lock,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useGitHub } from '../hooks/useGitHub';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const GitHubConnectPage: React.FC = () => {
  const { isConnected, status, loading, error, connect, sync } = useGitHub();
  const [allowPrivate, setAllowPrivate] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  const handleConnect = () => {
    connect(allowPrivate);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(null);
    try {
      await sync();
      setSyncSuccess('Repositories successfully synchronized and Code-DNA recalculated.');
      setTimeout(() => setSyncSuccess(null), 5000);
    } catch {
      // Error handled by hook
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#151717] tracking-tight">
            GitHub Telemetry Integration
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Connect your GitHub account to construct evidence-backed skill scores from genuine coding history.
          </p>
        </div>

        <DisclaimerBanner
          message="Activity data is evidence for review, not proof of authorship or AI use. SkillBridge computes deterministic scores based on languages, commit velocity, and repository architecture."
          variant="info"
        />

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {syncSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{syncSuccess}</span>
          </div>
        )}

        {/* State 1: Connected View */}
        {isConnected ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <GitBranch className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#151717]">
                      GitHub Connected: {status?.username || 'Active Account'}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                      Synchronized
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Last Synced: {status?.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : 'Recently'}
                  </p>
                </div>
              </div>

              {/* Sync Button */}
              <button
                type="button"
                disabled={syncing || loading}
                onClick={handleSync}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fd5800] hover:bg-[#e04e00] text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Synchronizing Repos...' : 'Re-sync GitHub Repos'}</span>
              </button>
            </div>

            {/* Scope Permissions Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Public Repositories
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Indexing commit volumes, languages, and PR activity across your public repositories.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                  {status?.privateGranted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                  Private Repositories
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {status?.privateGranted
                    ? 'Private repository metadata is being indexed with zero-retention privacy safeguards.'
                    : 'Private repository indexing is currently disabled. You can enable it in Consent Settings.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Not Connected (Onboarding View) */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <h3 className="text-xl font-bold text-slate-900">
                Authorize GitHub Telemetry
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect your GitHub profile via OAuth 2.0 to extract technical proof for your Code-DNA profile.
              </p>
            </div>

            {/* What is collected breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                What Telemetry is Collected:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Indexed Telemetry
                  </p>
                  <ul className="text-slate-600 space-y-1 list-disc pl-4 text-[11px]">
                    <li>Language bytecode & line distributions</li>
                    <li>Commit frequencies and timestamp intervals</li>
                    <li>Framework and library manifests (e.g. package.json)</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#125b63]" />
                    Never Collected or Stored
                  </p>
                  <ul className="text-slate-600 space-y-1 list-disc pl-4 text-[11px]">
                    <li>Proprietary source files or text</li>
                    <li>Environment secrets (.env) or tokens</li>
                    <li>Write permissions or SSH keys</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 bg-[#125b63]/5 rounded-xl border border-[#125b63]/20 text-xs">
                <input
                  type="checkbox"
                  id="consentPublic"
                  checked={true}
                  readOnly
                  className="mt-0.5 text-[#125b63] rounded focus:ring-[#125b63]"
                />
                <label htmlFor="consentPublic" className="text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">Public Repositories (Required for verification)</strong>
                  I authorize SkillBridge to inspect my public GitHub repositories to generate my baseline Code-DNA skill graph.
                </label>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
                <input
                  type="checkbox"
                  id="consentPrivate"
                  checked={allowPrivate}
                  onChange={(e) => setAllowPrivate(e.target.checked)}
                  className="mt-0.5 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="consentPrivate" className="text-slate-700">
                  <strong className="text-amber-900 block mb-0.5">
                    Include Private Repositories (Optional Opt-In)
                  </strong>
                  Allow indexing of metadata in private repositories. <em>Warning:</em> Grants read-only access to repository stats. No code will ever be published or stored.
                </label>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-all group"
              >
                <GitBranch className="w-4 h-4 text-slate-300" />
                <span>Connect GitHub Profile</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-1" />
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge GitHub Gateway &bull; Fine-grained read-only authorization
      </footer>
    </div>
  );
};

export default GitHubConnectPage;
