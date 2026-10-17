import { useState, useCallback, useEffect } from 'react';
import api from '../lib/api';
import { Profile, CodeDnaData } from '../types';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [codeDna, setCodeDna] = useState<CodeDnaData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/profile');
      const data = response.data.profile || response.data;
      setProfile(data);
      return data;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to fetch profile';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (data: Partial<Profile>): Promise<Profile> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/profile', data);
      const updated = response.data.profile || response.data;
      setProfile(updated);
      return updated;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to update profile';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCodeDna = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/profile/code-dna');
      const data: CodeDnaData = response.data;
      setCodeDna(data);
      return data;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to fetch Code-DNA data';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    codeDna,
    loading,
    error,
    fetchProfile,
    updateProfile,
    fetchCodeDna,
  };
};

export default useProfile;
