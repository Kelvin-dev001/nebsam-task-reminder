import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import TaskCard from '../components/TaskCard';
import Notifications from '../components/Notifications';
import { AuthContext } from '../contexts/AuthContext';
import ReportForm from '../components/forms/ReportForm';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Container, Grid, Paper, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Snackbar, Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../assets/logo.png';
import Loader from '../components/Loader';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Memos
  const [unseenMemos, setUnseenMemos] = useState([]);
  const [allMemos, setAllMemos] = useState([]);
  const [memoModalOpen, setMemoModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const theme = useTheme();
  const isMobile = useTheme().breakpoints.down("sm");
  const navigate = useNavigate();

  const openToast = (severity, message) => setToast({ open: true, severity, message });
  const closeToast = () => setToast({ ...toast, open: false });

  const fetchTasks = async () => {
    const params = filterDate ? { date: filterDate } : {};
    try {
      const res = await api.get('/tasks/my', { params, withCredentials: true });
      setTasks(res.data);
    } catch {
      setTasks([]);
    }
  };

  const fetchUnseenMemos = async () => {
    try {
      const res = await api.get('/memos/unseen', { withCredentials: true });
      setUnseenMemos(res.data || []);
      if ((res.data || []).length) setMemoModalOpen(true);
    } catch {
      // ignore
    }
  };

  const fetchMemos = async () => {
    try {
      const [unseenRes, allRes] = await Promise.all([
        api.get('/memos/unseen', { withCredentials: true }),
        api.get('/memos', { withCredentials: true })
      ]);
      setUnseenMemos(unseenRes.data || []);
      setAllMemos(allRes.data || []);
      if ((unseenRes.data || []).length) setMemoModalOpen(true);
    } catch {
      setUnseenMemos([]);
      setAllMemos([]);
    }
  };

  const fetchDepsAndShowrooms = async () => {
    try {
      const [depRes, shRes] = await Promise.all([
        api.get('/departments/list', { withCredentials: true }),
        api.get('/showrooms/list', { withCredentials: true })
      ]);
      setDepartments(depRes.data || []);
      setShowrooms(shRes.data || []);
    } catch {
      setDepartments([]);
      setShowrooms([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchDepsAndShowrooms(), fetchTasks(), fetchMemos()]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [filterDate]);

  // Poll unseen memos every 60s
  useEffect(() => {
    const interval = setInterval(fetchUnseenMemos, 60000);
    return () => clearInterval(interval);
  }, []);

  const markMemoSeen = async (id) => {
    try {
      await api.post(`/memos/${id}/seen`, {}, { withCredentials: true });
      setUnseenMemos(prev => prev.filter(m => m._id !== id));
      if (unseenMemos.length <= 1) setMemoModalOpen(false);
    } catch {
      // ignore
    }
  };

  // Update Task status
  const handleUpdate = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status }, { withCredentials: true });
      fetchTasks();
    } catch {
      openToast('error', 'Failed to update task');
    }
  };

  // Submit Daily Report with toast
  const handleSubmitReport = async (payload) => {
    try {
      await api.post('/reports', payload, { withCredentials: true });
      openToast('success', 'Report submitted/updated');
    } catch (err) {
      openToast('error', err.response?.data?.error || 'Failed to submit report');
    }
  };

  // Handle Logout with redirect
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e3ecfa" }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Box sx={{ mr: 2, width: 40, height: 40 }}>
            <img src={logo} alt="Company Logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Nebsam Task Reminder
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user && user.name}
          </Typography>
          <IconButton color="inherit" edge="end" title="Logout" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'center', mr: 1 }}>
          Hi Cousins <span role="img" aria-label="waving hand">👋</span>
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4, pb: 6 }}>
        <Notifications user={user} />

        {/* Submit Daily Report */}
        <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Submit / Update Daily Report
          </Typography>
          <ReportForm
            departments={departments}
            showrooms={showrooms}
            onSubmit={handleSubmitReport}
          />
        </Paper>

        {/* Memo list */}
        <Paper elevation={2} sx={{ p: isMobile ? 2 : 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Memos</Typography>
          {allMemos.length === 0 && (
            <Typography variant="body2" color="text.secondary">No memos yet.</Typography>
          )}
          <Stack spacing={1.5}>
            {allMemos.map(m => (
              <Paper key={m._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{m.title}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, mb: 0.5 }}>{m.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  By: {m.createdBy?.name || m.createdBy?.email} — {new Date(m.createdAt).toLocaleString()}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>

        {/* Filter */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Filter tasks by Date:
            </Typography>
            <TextField
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 200 }}
            />
            <Button onClick={() => setFilterDate('')} color="secondary" variant="outlined" size="small">
              Clear
            </Button>
          </Box>
        </Paper>

        {/* Task List (receive/mark done only) */}
        <Grid container spacing={3}>
          {tasks.map(task => (
            <Grid item xs={12} sm={6} md={4} key={task._id}>
              <TaskCard task={task} onUpdate={handleUpdate} />
            </Grid>
          ))}
          {tasks.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                No tasks found for the selected date.
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Memo modal for unseen memos */}
      <Dialog open={memoModalOpen && unseenMemos.length > 0} onClose={() => setMemoModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Memo</DialogTitle>
        <DialogContent dividers>
          {unseenMemos.map(m => (
            <Box key={m._id} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{m.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>{m.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                By: {m.createdBy?.name || m.createdBy?.email} — {new Date(m.createdAt).toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button size="small" variant="outlined" onClick={() => markMemoSeen(m._id)}>
                  Mark as read
                </Button>
              </Box>
            </Box>
          ))}
          {unseenMemos.length === 0 && (
            <Typography variant="body2" color="text.secondary">No new memos.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemoModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.severity} sx={{ fontWeight: 700 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;