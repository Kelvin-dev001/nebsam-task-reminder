import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Button, TextField, Grid, Box, Typography, Container, Snackbar,
  Paper, Alert, Link
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ceoTheme from './theme';
import logo from '../../assets/logo.png';

const CeoLoginPage = () => {
  const { ceoLogin } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: "success" });
  const navigate = useNavigate();

  const handleInputChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setSnack({ open: false, message: '', severity: "success" });
    try {
      await ceoLogin(form.email, form.password);
      setSnack({ open: true, message: "Welcome, CEO! 👑", severity: "success" });
      setTimeout(() => {
        navigate('/ceo');
      }, 800);
    } catch (err) {
      setSnack({
        open: true,
        message: err.message || err.response?.data?.error || 'Login failed!',
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={ceoTheme}>
      <Container component="main" maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Paper elevation={6} sx={{
          p: 4, width: "100%", borderRadius: 3, background: "#fff"
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <img src={logo} alt="Company Logo" style={{ width: 90, height: 90, borderRadius: 20 }} />
            </Box>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}>
              CEO Portal Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
              Executive access only
            </Typography>
            <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth label="Email Address" name="email"
                    autoComplete="email" value={form.email}
                    onChange={handleInputChange} type="email" inputProps={{ maxLength: 50 }} autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth name="password" label="Password"
                    type="password" value={form.password}
                    onChange={handleInputChange}
                    inputProps={{ minLength: 6, maxLength: 30 }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600, fontSize: "1.1em" }}
                disabled={loading}
                endIcon={<LockOpenIcon />}
              >
                {loading ? 'Signing in...' : 'Login'}
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
      </Container>
    </ThemeProvider>
  );
};
export default CeoLoginPage;