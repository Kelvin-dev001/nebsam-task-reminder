import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import TaskCard from '../components/TaskCard';
import Notifications from '../components/Notifications';
import { AuthContext } from '../contexts/AuthContext';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Container, Grid, Paper, Button, TextField, MenuItem, Select, InputLabel, FormControl, useMediaQuery
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
  const [filterDate, setFilterDate] = useState('');
  const [form, setForm] = useState({ title: '', description: '', department: '' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Fetch tasks
  const fetchTasks = async () => {
    const params = filterDate ? { date: filterDate } : {};
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/tasks/my`, { params, withCredentials: true });
    setTasks(res.data);
  };

  // Fetch departments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/tasks/my`, { params, withCredentials: true });
        setDepartments(depRes.data);
        await fetchTasks();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [filterDate]);

  // Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    setAdding(true);
    await axios.post('${process.env.REACT_APP_API_URL}/tasks/add', form, { withCredentials: true });
    setForm({ title: '', description: '', department: '' });
    setAdding(false);
    fetchTasks();
  };

  // Update Task status
  const handleUpdate = async (id, status) => {
    await axios.patch(`${process.env.REACT_APP_API_URL}/tasks/${id}/status`, { status }, { withCredentials: true });
    fetchTasks();
  };

  // Handle Logout with redirect
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e3ecfa" }}>
      {/* App Bar */}
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

      <Box sx={{
        mt: 3,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            textAlign: 'center',
            mr: 1
          }}
        >
          Hi Cousins <span role="img" aria-label="waving hand">👋</span>
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4, pb: 6 }}>
        <Notifications user={user} />

        {/* Task Add Form */}
        <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Add New Task
          </Typography>
          <Box component="form" onSubmit={handleAddTask} sx={{ display: 'flex', flexDirection: isMobile ? "column" : "row", gap: 2 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                value={form.department}
                label="Department"
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                <MenuItem value="">Select Department</MenuItem>
                {departments.map(d => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary" disabled={adding} sx={{ minWidth: 130 }}>
              {adding ? "Adding..." : "Add Task"}
            </Button>
          </Box>
        </Paper>

        {/* Filter */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Filter by Date:
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

        {/* Task List */}
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
    </Box>
  );
};

export default Dashboard;