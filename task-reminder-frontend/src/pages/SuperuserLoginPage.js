import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Box, Paper, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';

const SuperuserLoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnack({ open: false, message: '', severity: 'success' });
    try {
      const data = await login(email, password);
      const user = data.user;
      if (user && user.role === 'superuser') {
        if (user.requiresPasswordChange) {
          navigate('/change-password');
        } else {
          navigate('/super');
        }
      } else {
        setSnack({ open: true, message: 'You do not have superuser privileges.', severity: 'error' });
      }
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.error || 'Superuser login failed',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e3ecfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper sx={{ p: 5, borderRadius: 3, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: 700 }}>
          Superuser Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Superuser Email"
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
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </Paper>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperuserLoginPage;