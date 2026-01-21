import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Typography
} from '@mui/material';
import api from '../api';

const ForgotPasswordDialog = ({ open, onClose }) => {
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'info' });

  const resetState = () => {
    setStep('request');
    setUsername('');
    setOtp('');
    setNewPassword('');
    setConfirm('');
    setMessage({ text: '', severity: 'info' });
  };

  const handleClose = () => {
    resetState();
    onClose && onClose();
  };

  const handleRequest = async () => {
    if (!username.trim()) {
      setMessage({ text: 'Username (email) is required', severity: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', severity: 'info' });
    try {
      await api.post('/auth/forgot-password', { username: username.trim() });
      setMessage({ text: 'OTP sent if the account exists.', severity: 'success' });
      setStep('reset');
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || 'Failed to send OTP',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      setMessage({ text: 'OTP and new password are required', severity: 'error' });
      return;
    }
    if (newPassword !== confirm) {
      setMessage({ text: 'Passwords do not match', severity: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', severity: 'info' });
    try {
      await api.post('/auth/reset-password', {
        username: username.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setMessage({ text: 'Password reset successful. You can now log in.', severity: 'success' });
      setTimeout(handleClose, 800);
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || 'Failed to reset password',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Forgot Password</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Username (email)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            autoFocus
            required
          />
          {step === 'reset' && (
            <>
              <TextField
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                fullWidth
                required
              />
            </>
          )}
          {message.text && (
            <Typography color={message.severity === 'error' ? 'error' : 'success.main'} variant="body2">
              {message.text}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        {step === 'request' ? (
          <Button onClick={handleRequest} variant="contained" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </Button>
        ) : (
          <Button onClick={handleReset} variant="contained" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;