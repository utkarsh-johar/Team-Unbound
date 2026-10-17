import { useState, useCallback } from 'react';
import api from '../lib/api';
import { Referral } from '../types';

export const useReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async (params?: Record<string, string | number | boolean | undefined>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/referrals', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.referrals || [];
      setReferrals(data);
      return data;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to fetch referrals';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createReferral = async (data: Partial<Referral> & { recruiterEmail?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/referrals', data);
      const newReferral: Referral = response.data.referral || response.data;
      setReferrals((prev) => [newReferral, ...prev]);
      return newReferral;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to create referral';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getReferralDetail = async (id: string): Promise<Referral> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/referrals/${id}`);
      return response.data.referral || response.data;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to fetch referral details';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectCandidate = async (referralId: string, candidateId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/referrals/${referralId}/select`, { candidateId });
      return response.data;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to select candidate';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async (referralId: string): Promise<{ inviteUrl: string; token: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/referrals/${referralId}/invite`);
      return response.data;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to generate recruiter invite link';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    referrals,
    loading,
    error,
    fetchReferrals,
    createReferral,
    getReferralDetail,
    selectCandidate,
    generateInvite,
  };
};

export default useReferrals;
