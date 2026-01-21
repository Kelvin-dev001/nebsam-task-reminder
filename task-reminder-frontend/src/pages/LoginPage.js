import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Button, TextField, Grid, Box, Typography, Container, Snackbar,
  Paper, useMediaQuery, Alert, Link
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useTheme } from '@mui/material/styles';
import logo from '../assets/logo.png';
import ForgotPasswordDialog from '../components/ForgotPasswordDialog';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: "success" });
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleInputChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocalLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setSnack({ open: false, message: '', severity: "success" });
    try {
      const data = await login(form.email, form.password);
      setSnack({ open: true, message: "Login successful! 🎉", severity: "success" });
      setTimeout(() => {
        if (data.user.requiresPasswordChange) {
          navigate('/change-password');
        } else {
          navigate('/user');
        }
      }, 800);
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.error || 'Login failed!',
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper elevation={isMobile ? 0 : 4} sx={{
        p: isMobile ? 2 : 4,
        width: "100%",
        borderRadius: 3,
        boxShadow: isMobile ? "none" : undefined,
        background: "#fff"
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 2, width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="NEBSAM Digital Solutions" style={{ width: "100%", height: "auto", borderRadius: 16 }} />
          </Box>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
            Login
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
            NEBSAM 411
          </Typography>
          <Box component="form" noValidate onSubmit={handleLocalLogin} sx={{ mt: 1 }}>
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleInputChange}
                  type="email"
                  inputProps={{ maxLength: 50 }}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleInputChange}
                  inputProps={{ minLength: 6, maxLength: 30 }}
                  autoComplete="current-password"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 1, textAlign: 'right' }}>
              <Link component="button" type="button" onClick={() => setForgotOpen(true)} underline="hover">
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: isMobile ? 2 : 3, mb: 2, py: 1.5, fontWeight: 600 }}
              disabled={loading}
              size="large"
              endIcon={<LockOpenIcon />}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Box>
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

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Container>
  );
};

export default LoginPage;