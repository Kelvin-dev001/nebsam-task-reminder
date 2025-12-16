import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Typography, Button, Stack } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper sx={{ p: 4, width: '100%', borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            NEBSAM 411
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose your portal to continue 🎅
          </Typography>
        </Box>
        <Stack spacing={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SecurityIcon />}
            onClick={() => navigate('/super-login')}
          >
            Superuser Portal
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => navigate('/admin-login')}
          >
            Admin Portal
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/login')}
          >
            User Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LandingPage;