import React, { useState } from 'react';
import { ShieldAlert, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Appeal } from '../types';

interface AppealFormProps {
  credibilityHistoryId?: string;
  existingAppeal?: Appeal | null;
  onSubmit: (reason: string) => Promise<void>;
  onCancel?: () => void;
}

export const AppealForm: React.FC<AppealFormProps> = ({
  existingAppeal,
  onSubmit,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for your appeal.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(reason);
      setReason('');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to submit appeal. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (existingAppeal) {
    const getStatusInfo = () => {
      switch (existingAppeal.status) {
        case 'reversed':
          return {
            badge: (
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Appeal Reversed (Points Restored)
              </span>
            ),
            bg: 'bg-emerald-50/50 border-emerald-200',
          };
        case 'upheld':
          return {
            badge: (
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-200 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Appeal Upheld (Penalty Maintained)
              </span>
            ),
            bg: 'bg-rose-50/50 border-rose-200',
          };
        case 'pending':
        default:
          return {
            badge: (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Under Admin Review
              </span>
            ),
            bg: 'bg-amber-50/50 border-amber-200',
          };
      }
    };

    const statusInfo = getStatusInfo();

    return (
      <div className={`p-4 rounded-xl border ${statusInfo.bg} space-y-3`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Appeal Status</span>
          {statusInfo.badge}
        </div>
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-0.5">Your Submitted Statement:</p>
          <p className="italic bg-white/80 p-2.5 rounded-lg border border-slate-200">
            &ldquo;{existingAppeal.reason}&rdquo;
          </p>
        </div>
        {existingAppeal.adminNotes && (
          <div className="text-xs text-slate-700 pt-2 border-t border-slate-200">
            <span className="font-semibold">Admin Determination: </span>
            {existingAppeal.adminNotes}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
      <div className="flex items-center gap-2 text-slate-800">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
        <h5 className="text-xs font-bold uppercase tracking-wider">Submit Credibility Appeal</h5>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">
        If you believe this penalty was applied unfairly (for instance, the screening failure was due to role cancellation or sudden team headcount changes rather than skill mismatch), please explain your circumstances:
      </p>

      {error && (
        <div className="p-2 bg-rose-50 text-rose-700 rounded text-xs font-medium border border-rose-200">
          {error}
        </div>
      )}

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#125b63] bg-white"
        placeholder="Provide details regarding the referral outcome and why the penalty should be reviewed..."
        disabled={submitting}
      />

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !reason.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#fd5800] hover:bg-[#e04e00] rounded-lg shadow-sm disabled:opacity-50 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          {submitting ? 'Submitting...' : 'Submit Appeal'}
        </button>
      </div>
    </form>
  );
};

export default AppealForm;
