import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import TaskCard from '../components/TaskCard';
import { AuthContext } from '../contexts/AuthContext';
import {
  AppBar, Toolbar, Typography, Container, Tabs, Tab, Box, Paper, Button,
  IconButton, TextField, MenuItem, Select, InputLabel, FormControl, Grid, Divider, useMediaQuery,
  Snackbar, Alert
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../assets/logo.png';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);

  // Departments
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [addingDept, setAddingDept] = useState(false);

  // Users
  const [users, setUsers] = useState([]);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ user: '', department: '', date: '' });

  // Assign Task
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: '',
    description: '',
    department: '',
    assignedTo: '',
    deadline: ''
  });
  const [assignLoading, setAssignLoading] = useState(false);

  // Toast/Notification for assign task
  const [assignToast, setAssignToast] = useState({
    open: false,
    success: true,
    message: ''
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch all admin data
  const fetchData = async () => {
    try {
      const [deptRes, usersRes, tasksRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/departments/list`),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/users`),
        axios.get(`${process.env.REACT_APP_API_URL}/tasks/filter`, { params: filters }),
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
    } catch (err) {
      setDepartments([]);
      setUsers([]);
      setTasks([]);
      console.error("AdminPanel fetchData error:", err);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  // Department creation
  const handleAddDept = async (e) => {
    e.preventDefault();
    setAddingDept(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/departments/add`, { name: newDept });
      setNewDept('');
      fetchData();
    } catch (err) {
      console.error("Error adding department:", err);
    } finally {
      setAddingDept(false);
    }
  };

  // Department delete
  const handleDeleteDept = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/departments/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting department:", err);
    }
  };

  // User delete
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/admin/users/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Tab change
  const handleTabChange = (_, newValue) => setTab(newValue);

  // Assign Task UI
  const handleAssignOpen = () => setAssignOpen(true);
  const handleAssignClose = () => {
    setAssignOpen(false);
    setAssignForm({
      title: '',
      description: '',
      department: '',
      assignedTo: '',
      deadline: ''
    });
  };
  const handleAssignChange = (e) => setAssignForm({ ...assignForm, [e.target.name]: e.target.value });

  const handleAssignTask = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/tasks/assign`, assignForm);
      handleAssignClose();
      fetchData();
      setAssignToast({
        open: true,
        success: true,
        message: "Task assigned successfully!"
      });
    } catch (err) {
      setAssignToast({
        open: true,
        success: false,
        message: err?.response?.data?.error || "Failed to assign task"
      });
      console.error("Error assigning task:", err);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAssignToastClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setAssignToast({ ...assignToast, open: false });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e3ecfa" }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Box sx={{ mr: 2, width: 40, height: 40 }}>
            <img src={logo} alt="Company Logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            NEBSAM Admin Panel
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user ? `${user.name} (${user.role})` : 'Not logged in'}
          </Typography>
          <Button
            color="secondary"
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 2, fontWeight: 700 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Tabs value={tab} onChange={handleTabChange} variant={isMobile ? "scrollable" : "fullWidth"}>
          <Tab label="Departments" />
          <Tab label="Users" />
          <Tab label="Tasks" />
        </Tabs>

        {/* Departments Tab */}
        {tab === 0 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Manage Departments</Typography>
            <Box component="form" onSubmit={handleAddDept} sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? "column" : "row" }}>
              <TextField
                label="New Department"
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<AddCircleIcon />}
                disabled={addingDept}
                sx={{ minWidth: 140 }}
              >
                {addingDept ? "Adding..." : "Add Department"}
              </Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              {Array.isArray(departments) && departments.map(dept => (
                <Grid item xs={12} sm={6} key={dept._id}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
                    <Typography fontWeight={600}>{dept.name}</Typography>
                    <IconButton color="error" onClick={() => handleDeleteDept(dept._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
              {departments.length === 0 && (
                <Grid item xs={12}><Typography>No departments found.</Typography></Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Users Tab */}
        {tab === 1 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Manage Users</Typography>
            <Grid container spacing={2}>
              {Array.isArray(users) && users.map(u => (
                <Grid item xs={12} sm={6} key={u._id}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      <Typography variant="caption" color="secondary">{u.role}</Typography>
                    </Box>
                    <IconButton color="error" onClick={() => handleDeleteUser(u._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
              {users.length === 0 && (
                <Grid item xs={12}><Typography>No users found.</Typography></Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Tasks Tab */}
        {tab === 2 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Manage Tasks
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleIcon />}
              sx={{ mb: 2 }}
              onClick={handleAssignOpen}
            >
              Assign New Task
            </Button>
            {/* Assign Task Modal */}
            {assignOpen && (
              <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Assign Task</Typography>
                <Box component="form" onSubmit={handleAssignTask} sx={{ display: 'flex', flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Title"
                    name="title"
                    value={assignForm.title}
                    onChange={handleAssignChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    name="description"
                    value={assignForm.description}
                    onChange={handleAssignChange}
                    fullWidth
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department"
                      value={assignForm.department}
                      label="Department"
                      onChange={handleAssignChange}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {Array.isArray(departments) && departments.map(d => (
                        <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Assign To</InputLabel>
                    <Select
                      name="assignedTo"
                      value={assignForm.assignedTo}
                      label="Assign To"
                      onChange={handleAssignChange}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {Array.isArray(users) && users.map(u => (
                        <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    type="date"
                    name="deadline"
                    label="Deadline"
                    value={assignForm.deadline}
                    onChange={handleAssignChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={assignLoading}
                    >
                      {assignLoading ? "Assigning..." : "Assign Task"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleAssignClose}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, flexDirection: isMobile ? "column" : "row" }}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>User</InputLabel>
                <Select
                  value={filters.user}
                  label="User"
                  onChange={e => setFilters({ ...filters, user: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {Array.isArray(users) && users.map(u => (
                    <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department}
                  label="Department"
                  onChange={e => setFilters({ ...filters, department: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {Array.isArray(departments) && departments.map(d => (
                    <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                type="date"
                label="Date"
                value={filters.date}
                onChange={e => setFilters({ ...filters, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
              <Button onClick={() => setFilters({ user: '', department: '', date: '' })} color="secondary" variant="outlined">
                Clear Filters
              </Button>
            </Box>
            <Grid container spacing={3}>
              {Array.isArray(tasks) && tasks.map(task => (
                <Grid item xs={12} sm={6} md={4} key={task._id}>
                  <TaskCard task={task} />
                </Grid>
              ))}
              {tasks.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                    No tasks found for the selected filters.
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Container>
      {/* Assign Task Toaster */}
      <Snackbar
        open={assignToast.open}
        autoHideDuration={4000}
        onClose={handleAssignToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleAssignToastClose}
          severity={assignToast.success ? "success" : "error"}
          sx={{ fontWeight: 700, fontSize: "1rem" }}
          variant="filled"
        >
          {assignToast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;