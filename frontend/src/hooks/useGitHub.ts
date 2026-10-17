import { useState, useCallback, useEffect } from 'react';
import api from '../lib/api';
import { GitHubStatus } from '../types';

export const useGitHub = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/github/status');
      const data: GitHubStatus = response.data;
      setStatus(data);
      setIsConnected(Boolean(data.isConnected));
      return data;
    } catch (err: unknown) {
      setIsConnected(false);
      setStatus(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const connect = (allowPrivate: boolean = false) => {
    const url = allowPrivate ? '/api/github/connect?include_private=true' : '/api/github/connect';
    window.location.href = url;
  };

  const sync = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/github/sync');
      await checkStatus();
      return response.data;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to synchronize with GitHub';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    status,
    loading,
    error,
    connect,
    sync,
    checkStatus,
  };
};

export default useGitHub;
