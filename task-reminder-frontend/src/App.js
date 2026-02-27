import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import CustomerComplaintPage from './pages/CustomerComplaintPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SuperuserPanel from './pages/SuperuserPanel';
import SuperuserLoginPage from './pages/SuperuserLoginPage';
import CustomerSignupPage from './pages/CustomerSignupPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// CEO Portal - import your new feature components:
import CeoDashboardPage from './features/ceoDashboard/CeoDashboardPage';
import CeoLoginPage from './features/ceoDashboard/CeoLoginPage';

/**
 * PrivateRoute
 * - Restricts page access based on authentication and user role.
 * - extendable via props: adminOnly, superOnly, ceoOnly, allowChangePassword
 */
const PrivateRoute = ({
  children,
  adminOnly,
  superOnly,
  ceoOnly,
  allowChangePassword = false
}) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    // Route user to correct login depending on portal type
    if (ceoOnly) return <Navigate to="/ceo-login" />;
    return <Navigate to="/login" />;
  }
  if (user.requiresPasswordChange && !allowChangePassword) {
    return <Navigate to="/change-password" />;
  }
  if (superOnly && user.role !== 'superuser') {
    return <Navigate to="/" />;
  }
  if (adminOnly && !['admin', 'superuser'].includes(user.role)) {
    return <Navigate to="/" />;
  }
  if (ceoOnly && user.role !== 'ceo') {
    return <Navigate to="/ceo-login" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Staff auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/super-login" element={<SuperuserLoginPage />} />

          {/* CEO Portal auth */}
          <Route path="/ceo-login" element={<CeoLoginPage />} />

          {/* Customer auth */}
          <Route path="/customer-signup" element={<CustomerSignupPage />} />
          <Route path="/customer-login" element={<CustomerLoginPage />} />

          {/* Customer complaints */}
          <Route
            path="/customer-complaints"
            element={
              <PrivateRoute>
                <CustomerComplaintPage />
              </PrivateRoute>
            }
          />

          {/* Legacy complaints redirect */}
          <Route
            path="/complaints"
            element={<Navigate to="/customer-complaints" replace />}
          />

          <Route
            path="/change-password"
            element={
              <PrivateRoute allowChangePassword={true}>
                <ChangePasswordPage />
              </PrivateRoute>
            }
          />

          {/* User Dashboard */}
          <Route
            path="/user"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          {/* Superuser */}
          <Route
            path="/super"
            element={
              <PrivateRoute superOnly={true}>
                <SuperuserPanel />
              </PrivateRoute>
            }
          />

          {/* CEO Portal - Executive Analytics */}
          <Route
            path="/ceo"
            element={
              <PrivateRoute ceoOnly={true}>
                <CeoDashboardPage />
              </PrivateRoute>
            }
          />

          {/* Fallback: Not found/404 routes could go here if desired */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;