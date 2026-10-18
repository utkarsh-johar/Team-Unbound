import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  loginWithEmail: (data: { email: string; name?: string; role?: string; college?: string; branch?: string; graduationYear?: number }) => Promise<User>;
  demoLogin: (role: string) => Promise<void>;
  logout: () => Promise<void>;
  selectRole: (role: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  loginWithEmail: async () => { throw new Error('Not implemented'); },
  demoLogin: async () => {},
  logout: async () => {},
  selectRole: async () => {},
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else if (response.data && response.data.id) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error: unknown) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = () => {
    window.location.href = '/api/auth/google';
  };

  const demoLogin = async (role: string) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/demo-login', { role });
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        await refreshUser();
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (data: {
    email: string;
    name?: string;
    role?: string;
    college?: string;
    branch?: string;
    graduationYear?: number;
  }): Promise<User> => {
    try {
      setLoading(true);
      const res = await api.post('/auth/email-login', data);
      const authenticatedUser = res.data.user;
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // If POST fails, try GET fallback
      try {
        await api.get('/auth/logout');
      } catch {
        // Ignore network errors on logout
      }
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const selectRole = async (role: string) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/role', { role });
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        await refreshUser();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithEmail,
        demoLogin,
        logout,
        selectRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
