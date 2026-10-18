import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../lib/api';
import { User, Appeal, AuditLogEntry } from '../types';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';
import AuditLogTable from '../components/AuditLogTable';
import DemoBadge from '../components/DemoBadge';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'appeals' | 'audit'>('verifications');

  // Verification State
  const [pendingAlumni, setPendingAlumni] = useState<User[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);

  // Appeals State
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [appealsLoading, setAppealsLoading] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Action Dialog State
  const [selectedAction, setSelectedAction] = useState<{
    type: 'verify' | 'appeal';
    id: string;
    decision: string;
    title: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchVerifications = useCallback(async () => {
    setVerificationsLoading(true);
    try {
      const res = await api.get('/admin/verifications');
      const list = Array.isArray(res.data) ? res.data : res.data.alumni || [];
      setPendingAlumni(list);
    } catch {
      // Mock fallback if empty
      setPendingAlumni([]);
    } finally {
      setVerificationsLoading(false);
    }
  }, []);

  const fetchAppeals = useCallback(async () => {
    setAppealsLoading(true);
    try {
      const res = await api.get('/admin/appeals');
      const list = Array.isArray(res.data) ? res.data : res.data.appeals || [];
      setAppeals(list);
    } catch {
      setAppeals([]);
    } finally {
      setAppealsLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      const list = Array.isArray(res.data) ? res.data : res.data.logs || [];
      setAuditLogs(list);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerifications();
    fetchAppeals();
    fetchAuditLogs();
  }, [fetchVerifications, fetchAppeals, fetchAuditLogs]);

  const handleOpenAction = (
    type: 'verify' | 'appeal',
    id: string,
    decision: string,
    title: string
  ) => {
    setSelectedAction({ type, id, decision, title });
    setActionReason('');
    setActionError(null);
  };

  const handleExecuteAction = async () => {
    if (!selectedAction) return;
    if (!actionReason.trim()) {
      setActionError('A mandatory explanatory reason is required for compliance audit logs.');
      return;
    }

    setSubmittingAction(true);
    setActionError(null);

    try {
      if (selectedAction.type === 'verify') {
        await api.post(`/admin/verifications/${selectedAction.id}`, {
          action: selectedAction.decision, // 'approve' | 'reject'
          reason: actionReason,
        });
        await fetchVerifications();
      } else if (selectedAction.type === 'appeal') {
        await api.post(`/admin/appeals/${selectedAction.id}`, {
          action: selectedAction.decision, // 'upheld' | 'reversed'
          reason: actionReason,
        });
        await fetchAppeals();
      }

      await fetchAuditLogs();
      setSelectedAction(null);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to record decision.';
      setActionError(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DisclaimerBanner
          message="Administrative Governance Portal: Every approval, rejection, and appeal determination is immutably timestamped in the system audit log."
          variant="info"
        />

        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#125b63]">
                System Administration
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#125b63]/10 text-[#125b63] rounded-full border border-[#125b63]/20">
                Root Access
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#151717] tracking-tight mt-1">
              Admin Governance & Auditing
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review alumni credential proofs, resolve credibility score appeals, and inspect system audit ledgers.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('verifications')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'verifications'
                  ? 'bg-[#125b63] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#125b63]'
              }`}
            >
              Alumni Verifications ({pendingAlumni.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appeals')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'appeals'
                  ? 'bg-[#125b63] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#125b63]'
              }`}
            >
              Appeals ({appeals.filter((a) => a.status === 'pending').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'audit'
                  ? 'bg-[#125b63] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#125b63]'
              }`}
            >
              Audit Trail ({auditLogs.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Alumni Verifications */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#151717] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#125b63]" />
                  Pending Alumni Verifications
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify graduate identity and institutional affiliation before granting flash referral permissions
                </p>
              </div>
              <button
                type="button"
                onClick={fetchVerifications}
                className="text-xs text-[#125b63] hover:text-[#063f4a] flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {verificationsLoading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Loading pending alumni verifications...
              </div>
            ) : pendingAlumni.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Pending Verifications</p>
                <p className="text-xs text-slate-400">All registered alumni have been reviewed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingAlumni.map((alum) => (
                  <div
                    key={alum.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{alum.name}</h4>
                        {alum.isDemo && <DemoBadge />}
                        <span className="text-xs text-slate-400 font-mono">({alum.email})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Institution: <strong>{alum.institution?.name || alum.institutionId || 'Not specified'}</strong> &bull; Registered: {alum.createdAt ? new Date(alum.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                      {alum.profile?.summary && (
                        <p className="text-xs text-slate-600 mt-1 italic max-w-xl">
                          &ldquo;{alum.profile.summary}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenAction(
                            'verify',
                            alum.id,
                            'approve',
                            `Approve Alumni Verification: ${alum.name}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenAction(
                            'verify',
                            alum.id,
                            'reject',
                            `Reject Alumni Verification: ${alum.name}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Appeals Review */}
        {activeTab === 'appeals' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  Alumni Credibility Appeals
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review -20 credibility screening penalties disputed by alumni
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAppeals}
                className="text-xs text-[#125b63] hover:text-[#063f4a] flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {appealsLoading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Loading pending appeals...
              </div>
            ) : appeals.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Appeals on Docket</p>
                <p className="text-xs text-slate-400">All submitted penalty disputes have been settled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appeals.map((appeal) => {
                  const isPending = appeal.status === 'pending';

                  return (
                    <div
                      key={appeal.id}
                      className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            Appeal ID: <span className="font-mono text-[#125b63]">{appeal.id.slice(0, 8)}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              appeal.status === 'reversed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appeal.status === 'upheld'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {appeal.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Submitted on: {new Date(appeal.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700">
                        <span className="font-bold text-slate-900 block mb-1">
                          Alumnus Statement:
                        </span>
                        <p className="p-3 bg-white rounded-lg border border-slate-200 italic leading-relaxed">
                          &ldquo;{appeal.reason}&rdquo;
                        </p>
                      </div>

                      {appeal.adminNotes && (
                        <div className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-800">Admin Determination Note: </span>
                          {appeal.adminNotes}
                        </div>
                      )}

                      {isPending && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenAction(
                                'appeal',
                                appeal.id,
                                'reversed',
                                'Reverse Penalty (+20 Points Restored)'
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Reverse Penalty (Restore Points)
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenAction(
                                'appeal',
                                appeal.id,
                                'upheld',
                                'Uphold Penalty (-20 Points Maintained)'
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Uphold Penalty
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Audit Ledger */}
        {activeTab === 'audit' && (
          <AuditLogTable entries={auditLogs} loading={auditLoading} />
        )}

        {/* Action Confirmation Modal (Reason is REQUIRED) */}
        {selectedAction && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2.5 text-[#125b63] border-b border-slate-100 pb-3">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-bold text-base text-slate-900">{selectedAction.title}</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                SkillBridge audit policy mandates that every administrative decision carries an explicit rationale. This rationale will be permanently recorded in the system audit ledger.
              </p>

              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Mandatory Audit Rationale:
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Provide precise administrative context, policy citations, or verified credentials..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#125b63] bg-slate-50/50"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => setSelectedAction(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={submittingAction || !actionReason.trim()}
                  onClick={handleExecuteAction}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#fd5800] hover:bg-[#e04e00] rounded-lg shadow-sm disabled:opacity-50 transition-all"
                >
                  {submittingAction ? 'Writing to Audit Ledger...' : 'Commit Decision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge Administrative Ledger &bull; Immutable Audit Logging
      </footer>
    </div>
  );
};

export default AdminDashboard;
