import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Box, Paper, Typography, TextField, Button, Link } from '@mui/material';
import ForgotPasswordDialog from '../components/ForgotPasswordDialog';

const AdminLoginPage = () => {
  const { adminLogin } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await adminLogin(email, password);
      const user = data.user;
      if (user && (user.role === 'admin' || user.role === 'superuser')) {
        if (user.requiresPasswordChange) {
          navigate('/change-password');
        } else {
          navigate('/admin');
        }
      } else {
        setError('You do not have admin privileges.');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Admin login failed");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e3ecfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper sx={{ p: 5, borderRadius: 3, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: 700 }}>Admin Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Admin Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Box sx={{ textAlign: 'right', mb: 1 }}>
            <Link component="button" type="button" onClick={() => setForgotOpen(true)} underline="hover">
              Forgot password?
            </Link>
          </Box>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth>Login</Button>
        </form>
      </Paper>

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Box>
  );
};

export default AdminLoginPage;