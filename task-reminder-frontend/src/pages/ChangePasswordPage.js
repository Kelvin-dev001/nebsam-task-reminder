import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box, TextField, Typography, Button, Alert } from '@mui/material';

const ChangePasswordPage = () => {
  const { changePassword, logout } = useContext(AuthContext);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.newPassword !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await changePassword(form.oldPassword, form.newPassword);
      setSuccess('Password updated. Please log in again.');
      logout();
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ p: 4, borderRadius: 3, width: "100%" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Change Password</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You must change your temporary password before proceeding.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="password"
            label="Old Password"
            value={form.oldPassword}
            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            required
          />
          <TextField
            type="password"
            label="New Password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
            inputProps={{ minLength: 8 }}
          />
          <TextField
            type="password"
            label="Confirm New Password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Button variant="contained" type="submit">Update Password</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChangePasswordPage;