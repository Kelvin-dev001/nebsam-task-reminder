import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerLoginPage = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const startLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      const res = await api.post('/customer-auth/login', { phone, password });
      if (res.data.requiresOtp) {
        setMsg('OTP sent to your phone.');
        setStep(2);
      } else {
        setMsg('Login started, but OTP required.');
      }
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed to start login');
    } finally {
      setLoading(false);
    }
  };

  const verifyLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      const res = await api.post('/customer-auth/verify-login', { phone, otp });
      // JWT is set in cookie; we just update frontend context
      setUser(res.data.user);
      setMsg('Login successful.');
      navigate('/customer-complaints'); // or wherever your complaint page lives
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed to verify login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Customer Login
        </Typography>

        {step === 1 && (
          <Box component="form" onSubmit={startLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Phone (E.164)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Login'}
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box component="form" onSubmit={verifyLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Phone (E.164)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Login OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
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

export default CustomerLoginPage;