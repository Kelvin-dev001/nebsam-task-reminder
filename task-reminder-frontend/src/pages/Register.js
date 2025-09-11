import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Button, TextField, Link, Grid, Box, Typography, Container, Snackbar,
  Paper, useMediaQuery, Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTheme } from '@mui/material/styles';
import logo from '../assets/logo.png'; // Adjust the path if needed

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: "success" });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnack({ open: false, message: '', severity: "success" });
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        setSnack({ open: true, message: "Registration Successful! 🎉", severity: "success" });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setSnack({ open: true, message: data.error || 'Registration failed', severity: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Network error. Please try again.", severity: "error" });
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Box sx={{ mb: 2, width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logo} alt="NEBSAM Digital Solutions" style={{ width: "100%", height: "auto", borderRadius: 16 }} />
          </Box>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
            Create Account
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
            NEBSAM Digital Solutions (K) Ltd
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="name"
                  name="name"
                  required
                  fullWidth
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  inputProps={{ maxLength: 50 }}
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
                  onChange={handleChange}
                  inputProps={{ minLength: 6, maxLength: 30 }}
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: isMobile ? 2 : 3, mb: 2, py: 1.5, fontWeight: 600 }}
              disabled={loading}
              size="large"
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link href="/login" variant="body2" underline="hover">
                  Already have an account? <b>Login</b>
                </Link>
              </Grid>
            </Grid>
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
    </Container>
  );
};

export default Register;