import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RoleSelectPage from './pages/RoleSelectPage';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import AlumniDashboard from './pages/AlumniDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import FounderDashboard from './pages/FounderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ConsentPage from './pages/ConsentPage';
import GitHubConnectPage from './pages/GitHubConnectPage';
import ProfilePage from './pages/ProfilePage';
import CodeDnaPage from './pages/CodeDnaPage';
import ReferralsPage from './pages/ReferralsPage';
import CreateReferralPage from './pages/CreateReferralPage';
import ReferralDetailPage from './pages/ReferralDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import RecruiterInvitePage from './pages/RecruiterInvitePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/select-role" element={<RoleSelectPage />} />
          <Route path="/recruiter/invite/:token" element={<RecruiterInvitePage />} />

          {/* Core Dashboard Router */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-Specific Dashboards */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/alumni"
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <AlumniDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/recruiter"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/founder"
            element={
              <ProtectedRoute allowedRoles={['founder', 'admin']}>
                <FounderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile & Telemetry */}
          <Route
            path="/consent"
            element={
              <ProtectedRoute>
                <ConsentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/github/connect"
            element={
              <ProtectedRoute>
                <GitHubConnectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/code-dna"
            element={
              <ProtectedRoute>
                <CodeDnaPage />
              </ProtectedRoute>
            }
          />

          {/* Referrals & Opportunities */}
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <ReferralsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals/new"
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <CreateReferralPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals/:id"
            element={
              <ProtectedRoute>
                <ReferralDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Notifications Center */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
