import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container, Paper, Typography, TextField, Button, MenuItem, Grid, Box, Alert, Divider
} from '@mui/material';

const SuperuserPanel = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', role: 'user' });
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users`);
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/super/create-user`, form);
      setFeedback({ type: 'success', message: `User created. Temp password: ${res.data.credentials.tempPassword}` });
      setForm({ name: '', email: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to create user' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Superuser Panel</Typography>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Create User</Typography>
        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <TextField
            select
            label="Role"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="superuser">Superuser</MenuItem>
          </TextField>
          {feedback.message && <Alert severity={feedback.type}>{feedback.message}</Alert>}
          <Button type="submit" variant="contained">Create</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>All Users</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {users.map(u => (
            <Grid item xs={12} sm={6} key={u._id}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                <Typography variant="body2">{u.email}</Typography>
                <Typography variant="caption" color="secondary">{u.role}</Typography>
                {u.requiresPasswordChange && (
                  <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                    Requires password change
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
          {users.length === 0 && (
            <Grid item xs={12}>
              <Typography>No users found.</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default SuperuserPanel;