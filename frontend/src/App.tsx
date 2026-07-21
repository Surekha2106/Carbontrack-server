import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoutes';
import { DashboardLayout } from './layouts/DashboardLayout';

import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AcceptInvite from './pages/Auth/AcceptInvite';
import OAuth2RedirectHandler from './pages/Auth/OAuth2RedirectHandler';
import Dashboard from './pages/Dashboard/Dashboard';
import { ActivitiesPage } from './pages/Activities/ActivitiesPage';
import GoalsPage from './pages/Goals/GoalsPage';
import BadgesPage from './pages/Badges/BadgesPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import CommunityPage from './pages/Community/CommunityPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import { OrganisationPage } from './pages/Organisation/OrganisationPage';
import Aurora from './components/ui/Aurora';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <Aurora />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          
          {/* Auth Routes (only for unauthenticated users) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/organisation" element={<ErrorBoundary><OrganisationPage /></ErrorBoundary>} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
