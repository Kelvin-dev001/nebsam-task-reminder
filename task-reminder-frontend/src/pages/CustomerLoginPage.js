import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerLoginPage = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Forgot password state
  const [fpOpen, setFpOpen] = useState(false);
  const [fpOtpSent, setFpOtpSent] = useState(false);
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpMsg, setFpMsg] = useState('');
  const [fpErr, setFpErr] = useState('');

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      const res = await api.post('/customer-auth/login', { phone, password }, { withCredentials: true });
      setUser(res.data.user);
      setMsg('Login successful.');
      navigate('/customer-complaints');
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password flow
  const requestOtp = async () => {
    setFpErr('');
    setFpMsg('');
    if (!phone.trim()) {
      setFpErr('Phone is required');
      return;
    }
    try {
      await api.post('/customer-auth/forgot-password', { phone });
      setFpMsg('If the account exists, an OTP has been sent.');
      setFpOtpSent(true);
    } catch (error) {
      setFpErr(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const resetPassword = async () => {
    setFpErr('');
    setFpMsg('');
    if (!fpOtp.trim() || !fpNewPass.trim()) {
      setFpErr('OTP and new password are required');
      return;
    }
    try {
      await api.post('/customer-auth/reset-password', {
        phone,
        otp: fpOtp,
        newPassword: fpNewPass,
      });
      setFpMsg('Password reset successful. You can now log in.');
      setFpOtpSent(false);
      setFpOtp('');
      setFpNewPass('');
      setFpOpen(false);
    } catch (error) {
      setFpErr(error.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Customer Login
        </Typography>

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Phone (start with +2547…)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            fullWidth
            helperText="Use the phone you registered with. +2547…, 07… and 2547… are accepted."
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 1 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="text" onClick={() => setFpOpen(true)}>
              Forgot password?
            </Button>
          </Stack>
        </Box>

        {msg && (
          <Typography sx={{ mt: 2 }} color="success.main">
            {msg}
          </Typography>
        )}
        {err && (
          <Typography sx={{ mt: 2 }} color="error.main">
            {err}
          </Typography>
        )}
      </Paper>

      <Dialog open={fpOpen} onClose={() => { setFpOpen(false); setFpErr(''); setFpMsg(''); }}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
            <TextField
              label="Phone (start with +2547…)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
            />
            {!fpOtpSent && (
              <Button variant="contained" onClick={requestOtp}>
                Send OTP
              </Button>
            )}
            {fpOtpSent && (
              <>
                <TextField
                  label="OTP"
                  value={fpOtp}
                  onChange={(e) => setFpOtp(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={fpNewPass}
                  onChange={(e) => setFpNewPass(e.target.value)}
                  required
                  fullWidth
                />
                <Button variant="contained" onClick={resetPassword}>
                  Reset Password
                </Button>
              </>
            )}
            {fpMsg && (
              <Typography color="success.main" variant="body2">
                {fpMsg}
              </Typography>
            )}
            {fpErr && (
              <Typography color="error" variant="body2">
                {fpErr}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFpOpen(false); setFpErr(''); setFpMsg(''); }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerLoginPage;