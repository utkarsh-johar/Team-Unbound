import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (!user.role) {
        navigate('/select-role', { replace: true });
      } else {
        navigate(`/dashboard/${user.role}`, { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-10 h-10 text-[#125b63] animate-spin mb-3" />
      <p className="text-sm font-semibold text-slate-700">Directing to your dashboard...</p>
      <p className="text-xs text-slate-400 mt-1">Evaluating role permissions and active sessions</p>
    </div>
  );
};

export default Dashboard;
