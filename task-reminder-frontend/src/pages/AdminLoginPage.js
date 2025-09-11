import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';

const AdminLoginPage = () => {
  const { adminLogin } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await adminLogin(email, password);
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        setError('You do not have admin privileges.');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Admin login failed");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e3ecfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper sx={{ p: 5, borderRadius: 3, maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>Admin Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Admin Email"
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
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth>Login</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLoginPage;