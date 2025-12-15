import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';

const ChangePasswordPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleClose = () => setSnack({ ...snack, open: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setSnack({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSnack({ open: true, message: 'Not authenticated. Please log in again.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      await api.post(
        '/auth/change-password',
        { oldPassword: form.oldPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mark requiresPasswordChange=false locally
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, requiresPasswordChange: false }));

      setSnack({ open: true, message: 'Password updated. Redirecting to login...', severity: 'success' });
      setTimeout(() => navigate('/login'), 800); // redirect to login after success
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.error || 'Failed to change password',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e3ecfa', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Change Password</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please set a new password to continue.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Old Password"
            type="password"
            value={form.oldPassword}
            onChange={e => setForm({ ...form, oldPassword: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={e => setForm({ ...form, newPassword: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={snack.severity} sx={{ fontWeight: 700 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChangePasswordPage;