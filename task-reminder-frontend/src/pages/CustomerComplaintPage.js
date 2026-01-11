import React, { useEffect, useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Stack, Snackbar, Alert, MenuItem } from '@mui/material';
import api from '../api';

const CustomerComplaintPage = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    customerName: '',
    plateOrCompany: '',
    mobile: '',
    service: '',
    issue: ''
  });
  const [toast, setToast] = useState({ open: false, success: true, message: '' });

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments/public-list', { withCredentials: false });
      setDepartments(res.data || []);
    } catch (err) {
      setDepartments([]);
    }
  };

  useEffect(() => { loadDepartments(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', form, { withCredentials: false });
      setToast({ open: true, success: true, message: 'Complaint submitted successfully' });
      setForm({ customerName: '', plateOrCompany: '', mobile: '', service: '', issue: '' });
    } catch (err) {
      setToast({ open: true, success: false, message: err.response?.data?.error || 'Failed to submit complaint' });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Customer Complaint Portal</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please provide your details and a brief description of the issue.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Customer Name (optional)"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Vehicle Plate / Company Name"
            name="plateOrCompany"
            value={form.plateOrCompany}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Mobile Number"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            select
            label="Service Fitted With"
            name="service"
            value={form.service}
            onChange={handleChange}
            required
            fullWidth
          >
            {(departments.length ? departments : [
              { code: 'TRACK', name: 'Tracking' },
              { code: 'GOV', name: 'Speed Governor' },
              { code: 'RADIO', name: 'Radio Calls' },
              { code: 'FUEL', name: 'Fuel Monitoring' },
              { code: 'VTEL', name: 'Vehicle Telematics' },
              { code: 'ONLINE', name: 'Online Department' },
            ]).map(d => (
              <MenuItem key={d.code} value={d.code}>{d.name} ({d.code})</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Issue Description"
            name="issue"
            value={form.issue}
            onChange={handleChange}
            required
            fullWidth
            multiline
            rows={4}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button type="submit" variant="contained">Submit Complaint</Button>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.success ? "success" : "error"}
          sx={{ width: '100%', fontWeight: 700 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerComplaintPage;