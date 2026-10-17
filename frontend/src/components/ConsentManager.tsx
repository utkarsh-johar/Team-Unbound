import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  GitBranch,
  Lock,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import api from '../lib/api';
import { Consent } from '../types';
import DisclaimerBanner from './DisclaimerBanner';

export const ConsentManager: React.FC = () => {
  const [consent, setConsent] = useState<Consent>({
    userId: '',
    publicReposGranted: false,
    privateReposGranted: false,
    grantedAt: null,
    revokedAt: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmation Modals
  const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);
  const [showDeleteModalStep1, setShowDeleteModalStep1] = useState<boolean>(false);
  const [showDeleteModalStep2, setShowDeleteModalStep2] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');

  const fetchConsent = async () => {
    setLoading(true);
    try {
      const response = await api.get('/consent');
      if (response.data) {
        setConsent(response.data.consent || response.data);
      }
    } catch {
      // Use defaults if initial
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsent();
  }, []);

  const handleToggle = async (field: 'publicReposGranted' | 'privateReposGranted') => {
    const updated = { ...consent, [field]: !consent[field] };
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await api.put('/consent', {
        publicReposGranted: updated.publicReposGranted,
        privateReposGranted: updated.privateReposGranted,
      });
      setConsent(response.data.consent || updated);
      setSuccessMsg('Consent permissions successfully updated.');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to update consent preferences.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeConsent = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.post('/consent/revoke');
      setConsent((prev) => ({
        ...prev,
        publicReposGranted: false,
        privateReposGranted: false,
        revokedAt: new Date().toISOString(),
      }));
      setShowRevokeModal(false);
      setSuccessMsg('All GitHub data access consents have been revoked.');
    } catch (err: unknown) {
      setErrorMsg('Failed to revoke consent. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllData = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.delete('/consent/data');
      setShowDeleteModalStep2(false);
      setShowDeleteModalStep1(false);
      window.location.href = '/login?deleted=true';
    } catch (err: unknown) {
      setErrorMsg('Failed to purge user data. Please contact support.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        <p className="text-sm font-medium">Loading consent ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Consent Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Data Access & Consent Management</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SkillBridge operates on a strict consent-first principle. Nothing is ingested without explicit permission, and you retain complete control over your code telemetry.
          </p>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          {/* Public Repos Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Public GitHub Repositories</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Allows indexing of language distributions, commit counts, and pull requests on public repositories to assemble your Code-DNA evidence graph.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleToggle('publicReposGranted')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                  consent.publicReposGranted ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={consent.publicReposGranted}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    consent.publicReposGranted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Private Repos Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50/30 gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Private GitHub Repositories (Separate Opt-In)</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-full">
                    Opt-in Only
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Indexes commit frequencies and language tags from private projects. Uses least-privilege read-only access. <strong>Never</strong> stores or displays your proprietary source code.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleToggle('privateReposGranted')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                  consent.privateReposGranted ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={consent.privateReposGranted}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    consent.privateReposGranted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Last Granted:{' '}
              <strong>
                {consent.grantedAt ? new Date(consent.grantedAt).toLocaleString() : 'Not currently granted'}
              </strong>
            </span>
          </div>
          {consent.revokedAt && (
            <div className="text-rose-600">
              Revoked on: {new Date(consent.revokedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Revoke Action */}
        <div className="pt-2 flex justify-start">
          <button
            type="button"
            onClick={() => setShowRevokeModal(true)}
            disabled={saving || (!consent.publicReposGranted && !consent.privateReposGranted)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Revoke All Ingestion Access
          </button>
        </div>
      </div>

      {/* Danger Zone: Purge All Data */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-950">Danger Zone: Permanent Data Deletion</h4>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Permanently purges your account profile, Code-DNA records, and referral applications. Per PRD Section 10, system audit logs will be permanently pseudonymized to maintain historical integrity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModalStep1(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete All My Data
        </button>
      </div>

      {/* Explanatory Policy Banner */}
      <DisclaimerBanner
        message="Privacy Guarantee: SkillBridge only calculates derived skill signals. We never clone full repositories or store proprietary source files."
        variant="info"
      />

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Revoke GitHub Data Access?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Revoking consent immediately stops all ongoing and future repository synchronizations. Your existing Code-DNA scores will remain static until re-authorized.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Keep Access
              </button>
              <button
                type="button"
                onClick={handleRevokeConsent}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Step 1 Modal */}
      {showDeleteModalStep1 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Step 1 of 2: Delete All Account Data</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action is <strong>irreversible</strong>. It will immediately erase your profile, revoke all connected tokens, and remove your candidate records from active referrals.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModalStep1(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModalStep1(false);
                  setShowDeleteModalStep2(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                I Understand, Continue &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Step 2 Modal (Double Confirmation) */}
      {showDeleteModalStep2 && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-400 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Step 2 of 2: Final Confirmation</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              To proceed with permanent deletion, type <code className="font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded">DELETE MY DATA</code> below:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE MY DATA"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModalStep2(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE MY DATA' || saving}
                onClick={handleDeleteAllData}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-40"
              >
                {saving ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentManager;
