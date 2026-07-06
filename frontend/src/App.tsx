import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoutes';
import { DashboardLayout } from './layouts/DashboardLayout';

import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import OAuth2RedirectHandler from './pages/Auth/OAuth2RedirectHandler';
import Dashboard from './pages/Dashboard/Dashboard';
import { ActivitiesPage } from './pages/Activities/ActivitiesPage';
import PlaceholderPage from './pages/Placeholder/PlaceholderPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          
          {/* Auth Routes (only for unauthenticated users) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/goals" element={<PlaceholderPage title="Goals Tracker" />} />
              <Route path="/badges" element={<PlaceholderPage title="Achievements & Badges" />} />
              <Route path="/analytics" element={<PlaceholderPage title="Detailed Analytics" />} />
              <Route path="/leaderboard" element={<PlaceholderPage title="Community Leaderboard" />} />
              <Route path="/community" element={<PlaceholderPage title="Community Hub" />} />
              <Route path="/profile" element={<PlaceholderPage title="User Profile" />} />
              <Route path="/settings" element={<PlaceholderPage title="Account Settings" />} />
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
