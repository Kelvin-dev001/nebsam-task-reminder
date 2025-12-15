import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AdminLoginPage from './pages/AdminLoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SuperuserPanel from './pages/SuperuserPanel';
import SuperuserLoginPage from './pages/SuperuserLoginPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute = ({ children, adminOnly, superOnly, allowChangePassword = false }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (user.requiresPasswordChange && !allowChangePassword) return <Navigate to="/change-password" />;
  if (superOnly && user.role !== 'superuser') return <Navigate to="/" />;
  if (adminOnly && !['admin', 'superuser'].includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/super-login" element={<SuperuserLoginPage />} />
          <Route path="/change-password" element={
            <PrivateRoute allowChangePassword={true}>
              <ChangePasswordPage />
            </PrivateRoute>
          } />
          <Route path="/user" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <AdminPanel />
            </PrivateRoute>
          } />
          <Route path="/super" element={
            <PrivateRoute superOnly={true}>
              <SuperuserPanel />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;