import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
} from '@mui/material';
import api from '../api';

const CustomerSignupPage = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const startSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      await api.post('/customer-auth/signup', { phone, name });
      setMsg('OTP sent to your phone.');
      setStep(2);
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed to start signup');
    } finally {
      setLoading(false);
    }
  };

  const verifySignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      await api.post('/customer-auth/verify-signup', { phone, otp, password });
      setMsg('Signup complete. You can now log in.');
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed to verify signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Customer Signup
        </Typography>

        {step === 1 && (
          <Box component="form" onSubmit={startSignup} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Phone (E.164, e.g. +2547XXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box component="form" onSubmit={verifySignup} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Phone (E.164)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Set Password'}
              </Button>
              <Button variant="outlined" onClick={() => setStep(1)}>
                Back
              </Button>
            </Stack>
          </Box>
        )}

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
    </Container>
  );
};

export default CustomerSignupPage;