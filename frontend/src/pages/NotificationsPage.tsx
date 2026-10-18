import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Award,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'credibility':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'referral':
        return <Briefcase className="w-5 h-5 text-[#125b63]" />;
      case 'verification':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'consent':
        return <AlertTriangle className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleClickItem = async (id: string, link?: string) => {
    await markAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <DisclaimerBanner
          message="Notification Ledger: Displays real-time updates regarding your referral statuses, credibility score events, and institutional verifications."
          variant="info"
        />
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#125b63]">
                In-App Updates
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-[#125b63]/10 text-[#125b63] rounded-full border border-[#125b63]/20">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#151717] tracking-tight mt-1">
              Notification Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time notices on referral postings, candidate selections, and credibility shifts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#125b63]/10 hover:bg-[#125b63]/20 text-[#125b63] rounded-xl text-xs font-bold border border-[#125b63]/20 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All as Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'all'
                ? 'bg-[#125b63] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'unread'
                ? 'bg-[#125b63] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 p-8 space-y-2">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No notifications to display</p>
              <p className="text-xs text-slate-400">
                You are all caught up on system events and referral alerts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClickItem(item.id, item.link)}
                  className={`p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start gap-4 ${
                    !item.isRead ? 'bg-[#125b63]/5' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm ${!item.isRead ? 'font-bold text-[#151717]' : 'font-medium text-slate-700'}`}>
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#fd5800] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      {item.link && (
                        <span className="text-[#125b63] font-semibold flex items-center gap-1 hover:underline">
                          View Details &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge In-App Notifications &bull; Real-time system activity
      </footer>
    </div>
  );
};

export default NotificationsPage;
