import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import api from '../lib/api';
import { Notification } from '../types';
import { AuthContext } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await api.get('/notifications/unread-count');
      const count = typeof response.data.count === 'number' ? response.data.count : response.data.unreadCount || 0;
      setUnreadCount(count);
    } catch {
      // Ignore polling errors
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const response = await api.get('/notifications');
      const list = Array.isArray(response.data) ? response.data : response.data.notifications || [];
      setNotifications(list);
      const unread = list.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      // Ignore fetch errors
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();

      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await api.patch(`/notifications/${id}/read`).catch(async () => {
        // Fallback to PUT if PATCH not handled
        await api.put(`/notifications/${id}/read`);
      });
    } catch (err) {
      // Refetch if error occurs
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);

      await api.post('/notifications/mark-all-read').catch(async () => {
        await api.put('/notifications/read-all');
      });
    } catch (err) {
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
