import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Shield,
  Search,
  Filter,
  FileCode,
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogTableProps {
  entries: AuditLogEntry[];
  loading?: boolean;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ entries = [], loading = false }) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.actorName && entry.actorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || entry.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(entries.map((e) => e.action)));

  const toggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('REVOKE') || act.includes('REJECT') || act.includes('PENALTY')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('UPDATE') || act.includes('MODIFIED') || act.includes('APPEAL')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (act.includes('CREATE') || act.includes('APPROVE') || act.includes('GRANT') || act.includes('REFERRED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-[#125b63]/10 text-[#125b63] border-[#125b63]/20';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#125b63]" />
            System Audit & Accountability Ledger
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of score adjustments, referral decisions, and consent updates
          </p>
        </div>

        {/* Search & Action Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#125b63]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#125b63]"
            >
              <option value="ALL">All Actions</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-2.5 px-3"></th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Entity</th>
              <th className="py-2.5 px-3">Actor</th>
              <th className="py-2.5 px-3">Reason / Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  No audit log entries matching your criteria.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const isExpanded = expandedRowId === entry.id;
                const hasDiff = entry.before || entry.after;

                return (
                  <React.Fragment key={entry.id}>
                    <tr
                      onClick={() => hasDiff && toggleExpand(entry.id)}
                      className={`hover:bg-slate-50 transition-colors ${
                        hasDiff ? 'cursor-pointer' : ''
                      } ${isExpanded ? 'bg-[#125b63]/10' : ''}`}
                    >
                      <td className="py-3 px-3 text-slate-400 w-6">
                        {hasDiff && (
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#125b63]" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionColor(
                            entry.action
                          )}`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {entry.entity}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {entry.actorName || entry.actorRole || 'System'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate" title={entry.reason}>
                        {entry.reason}
                      </td>
                    </tr>

                    {/* Expandable Diff Row */}
                    {isExpanded && hasDiff && (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="p-4 border-y border-slate-200">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <FileCode className="w-4 h-4 text-[#125b63]" />
                              <span>State Mutation Snapshot (Before vs. After):</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-inner">
                                <span className="block font-bold text-rose-600 mb-1 border-b pb-1">
                                  State Before:
                                </span>
                                <pre className="overflow-x-auto text-slate-700 whitespace-pre-wrap">
                                  {entry.before
                                    ? JSON.stringify(entry.before, null, 2)
                                    : 'None (Initial Creation)'}
                                </pre>
                              </div>
                              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-inner">
                                <span className="block font-bold text-emerald-600 mb-1 border-b pb-1">
                                  State After:
                                </span>
                                <pre className="overflow-x-auto text-slate-700 whitespace-pre-wrap">
                                  {entry.after
                                    ? JSON.stringify(entry.after, null, 2)
                                    : 'None (Deleted)'}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogTable;
