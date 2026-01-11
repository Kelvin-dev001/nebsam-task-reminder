import React, { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';
import TaskCard from '../components/TaskCard';
import { AuthContext } from '../contexts/AuthContext';
import {
  AppBar, Toolbar, Typography, Container, Tabs, Tab, Box, Paper, Button,
  IconButton, TextField, MenuItem, Select, InputLabel, FormControl, Grid,
  Divider, useMediaQuery, Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, Table, TableBody, TableCell, TableHead, TableRow, Chip
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../assets/logo.png';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import Filters from '../components/Filters';
import KpiCards from '../components/KpiCards';
import TrendLineChart from '../components/charts/TrendLineChart';
import DeptBarChart from '../components/charts/DeptBarChart';
import ShowroomBarChart from '../components/charts/ShowroomBarChart';
import ReportForm from '../components/forms/ReportForm';
import BossMonthlyPies from '../components/charts/BossMonthlyPies';

const statusStyles = {
  new: { color: 'default', bg: '#f5f5f5' },
  assigned: { color: 'warning', bg: '#fff7e6' },
  resolved: { color: 'success', bg: '#e8f5e9' },
};

const SuperuserPanel = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);

  // Departments / Showrooms
  const [departments, setDepartments] = useState([]);
  const [showrooms, setShowrooms] = useState([]);

  // Users
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', role: 'user' });
  const [editingUserId, setEditingUserId] = useState(null);

  // Departments CRUD
  const [newDept, setNewDept] = useState({ name: '', code: '' });
  const [editingDept, setEditingDept] = useState(null);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ user: '', department: '', date: '' });
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: '',
    description: '',
    department: '',
    assignedTo: '',
    deadline: '',
    status: 'pending'
  });
  const [editingTask, setEditingTask] = useState(null);

  // Memos
  const [memos, setMemos] = useState([]);
  const [memoForm, setMemoForm] = useState({ title: '', message: '' });

  // Complaints
  const [complaints, setComplaints] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState('');
  const [assignComplaintOpen, setAssignComplaintOpen] = useState(false);
  const [complaintToAssign, setComplaintToAssign] = useState(null);
  const [assignComplaintForm, setAssignComplaintForm] = useState({
    title: '',
    description: '',
    department: '',
    assignedTo: '',
    deadline: '',
    status: 'pending'
  });

  // Analytics
  const [analyticsFilters, setAnalyticsFilters] = useState({ startDate: '', endDate: '', departmentId: '', showroomId: '' });
  const [trends, setTrends] = useState({ series: [], thisMonthSales: 0, lastMonthSales: 0, pctVsLastMonth: null });
  const [byDept, setByDept] = useState([]);
  const [trackingShowroomRollup, setTrackingShowroomRollup] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [monthly, setMonthly] = useState(null);

  // Toast
  const [toast, setToast] = useState({ open: false, success: true, message: '' });
  const showToast = (success, message) => setToast({ open: true, success, message });
  const closeToast = (_, reason) => { if (reason !== 'clickaway') setToast({ ...toast, open: false }); };

  const fetchMaster = async () => {
    try {
      const [deptRes, usersRes, memosRes, showroomsRes, complaintsRes] = await Promise.all([
        api.get('/departments/list'),
        api.get('/admin/users'),
        api.get('/memos'),
        api.get('/showrooms/list').catch(() => ({ data: [] })), // tolerate missing
        api.get('/complaints').catch(() => ({ data: [] }))      // tolerate missing
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setMemos(Array.isArray(memosRes.data) ? memosRes.data : []);
      setShowrooms(Array.isArray(showroomsRes.data) ? showroomsRes.data : []);
      setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
    } catch (err) {
      setDepartments([]); setUsers([]); setMemos([]); setShowrooms([]);
      showToast(false, err.response?.data?.error || "Failed to load data");
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksRes = await api.get('/tasks/filter', { params: filters });
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
    } catch (err) {
      setTasks([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = { ...analyticsFilters };
      const [trRes, dailyRes, subRes] = await Promise.all([
        api.get('/analytics/trends', { params }),
        api.get('/analytics/daily', { params }),
        api.get('/analytics/submission-status', { params: { date: analyticsFilters.endDate || analyticsFilters.startDate || new Date().toISOString().slice(0,10) } })
      ]);

      setTrends({
        series: trRes.data?.series || trRes.data || [],
        thisMonthSales: trRes.data?.thisMonthSales || 0,
        lastMonthSales: trRes.data?.lastMonthSales || 0,
        pctVsLastMonth: trRes.data?.pctVsLastMonth ?? null
      });

      setByDept(dailyRes.data?.byDept || []);
      setTrackingShowroomRollup(dailyRes.data?.trackingShowroomRollup || []);
      setSubmissionStatus(subRes.data || {});
    } catch (err) {
      showToast(false, err.response?.data?.error || "Failed to load analytics");
    }
  };

  const fetchMonthly = async () => {
    try {
      const res = await api.get('/analytics/monthly');
      setMonthly(res.data);
      showToast(true, "Monthly overview loaded");
    } catch (err) {
      showToast(false, err.response?.data?.error || "Failed to load monthly overview");
    }
  };

  // Submit Report (used in the Submit Report tab)
  const handleSubmitReport = async (payload) => {
    try {
      await api.post('/reports', payload);
      showToast(true, 'Report submitted/updated');
      fetchAnalytics();
      fetchMonthly();
    } catch (err) {
      showToast(false, err.response?.data?.error || 'Failed to submit report');
    }
  };

  useEffect(() => { fetchMaster(); }, []);
  useEffect(() => { fetchTasks(); }, [filters]);
  useEffect(() => { fetchAnalytics(); /* eslint-disable-next-line */ }, [analyticsFilters.departmentId, analyticsFilters.showroomId]);

  // Departments CRUD
  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departments/add', { name: newDept.name, code: newDept.code });
      setNewDept({ name: '', code: '' });
      fetchMaster();
      showToast(true, "Department added");
    } catch (err) { showToast(false, err.response?.data?.error || "Failed to add department"); }
  };

  const handleUpdateDept = async () => {
    try {
      await api.put(`/departments/${editingDept._id}`, { name: editingDept.name, code: editingDept.code });
      setEditingDept(null);
      fetchMaster();
      showToast(true, "Department updated");
    } catch (err) { showToast(false, err.response?.data?.error || "Failed to update department"); }
  };

  const handleDeleteDept = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      fetchMaster();
      showToast(true, "Department deleted");
    } catch (err) {
      showToast(false, err.response?.data?.error || "Failed to delete department");
    }
  };

  // Users
  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await api.patch(`/admin/users/${editingUserId}`, userForm);
        showToast(true, "User updated");
      } else {
        await api.post('/auth/super/create-user', userForm);
        showToast(true, "User created. OTP sent via SMS (if configured).");
      }
      setUserForm({ name: '', email: '', phone: '', role: 'user' });
      setEditingUserId(null);
      fetchMaster();
    } catch (err) {
      showToast(false, err.response?.data?.error || 'User create/update failed');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      fetchMaster();
      showToast(true, "User deleted");
    } catch (err) {
      showToast(false, err.response?.data?.error || 'User delete failed');
    }
  };

  // Tasks
  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks/assign', assignForm);
      setAssignOpen(false);
      setAssignForm({ title: '', description: '', department: '', assignedTo: '', deadline: '', status: 'pending' });
      fetchTasks();
      showToast(true, "Task assigned");
    } catch (err) {
      showToast(false, err.response?.data?.error || "Failed to assign task");
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/tasks/${editingTask._id}`, editingTask);
      setEditingTask(null);
      fetchTasks();
      showToast(true, "Task updated");
    } catch (err) {
      showToast(false, err.response?.data?.error || "Failed to update task");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      showToast(true, "Task deleted");
    } catch (err) {
      showToast(false, err.response?.data?.error || "Failed to delete task");
    }
  };

  // Memos
  const handleCreateMemo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/memos', memoForm);
      setMemoForm({ title: '', message: '' });
      fetchMaster();
      showToast(true, "Memo broadcasted");
    } catch (err) {
      showToast(false, err.response?.data?.error || "Failed to broadcast memo");
    }
  };

  // Complaints
  const filteredComplaints = complaints.filter(c => !complaintFilter || c.service === complaintFilter);

  const openAssignComplaint = (complaint) => {
    setComplaintToAssign(complaint);
    setAssignComplaintForm({
      title: `Complaint: ${complaint.plateOrCompany}`,
      description: complaint.issue,
      department: '',
      assignedTo: '',
      deadline: '',
      status: 'pending'
    });
    setAssignComplaintOpen(true);
  };

  const handleAssignComplaint = async (e) => {
    e.preventDefault();
    if (!complaintToAssign) return;
    try {
      await api.post(`/complaints/${complaintToAssign._id}/assign`, {
        title: assignComplaintForm.title,
        description: assignComplaintForm.description,
        department: assignComplaintForm.department,
        assignedTo: assignComplaintForm.assignedTo,
        deadline: assignComplaintForm.deadline,
        status: assignComplaintForm.status
      });
      setAssignComplaintOpen(false);
      setComplaintToAssign(null);
      fetchMaster(); // refresh complaints + users/departments
      fetchTasks();  // refresh tasks list
      showToast(true, "Complaint assigned to task");
    } catch (err) {
      showToast(false, err.response?.data?.error || "Failed to assign complaint");
    }
  };

  const deptLookup = useMemo(() => Object.fromEntries(departments.map(d => [d._id, d.name])), [departments]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const complaintRowStyle = (status) => {
    const key = status || 'new';
    return {
      backgroundColor: statusStyles[key]?.bg || '#f5f5f5'
    };
  };

  const statusChip = (status) => {
    const key = status || 'new';
    return (
      <Chip
        label={key.toUpperCase()}
        size="small"
        color={statusStyles[key]?.color || 'default'}
        variant="filled"
      />
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e3ecfa" }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Box sx={{ mr: 2, width: 40, height: 40 }}>
            <img src={logo} alt="Company Logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            NEBSAM Superuser Panel
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

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant={isMobile ? "scrollable" : "fullWidth"}>
          <Tab label="Users" />
          <Tab label="Departments" />
          <Tab label="Tasks" />
          <Tab label="Memos" />
          <Tab label="Analytics" />
          <Tab label="Submit Report" />
          <Tab label="Complaints" />
        </Tabs>

        {/* Users Tab */}
        {tab === 0 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              {editingUserId ? "Edit User" : "Create User"}
            </Typography>
            <Box component="form" onSubmit={handleCreateOrUpdateUser} sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? "column" : "row", flexWrap: 'wrap' }}>
              <TextField label="Full Name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required fullWidth />
              <TextField label="Email" type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required fullWidth />
              <TextField label="Phone (E.164, e.g., +15551234567)" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} required fullWidth />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Role</InputLabel>
                <Select value={userForm.role} label="Role" onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="superuser">Superuser</MenuItem>
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" startIcon={<AddCircleIcon />}>
                {editingUserId ? "Update User" : "Create User"}
              </Button>
              {editingUserId && (
                <Button variant="outlined" color="secondary" onClick={() => { setEditingUserId(null); setUserForm({ name: '', email: '', phone: '', role: 'user' }); }}>
                  Cancel Edit
                </Button>
              )}
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              {Array.isArray(users) && users.map(u => (
                <Grid item xs={12} sm={6} md={4} key={u._id}>
                  <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      <Typography variant="caption" color="secondary">{u.role}</Typography>
                      {u.requiresPasswordChange && (
                        <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                          Requires password change
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton color="primary" onClick={() => { setEditingUserId(u._id); setUserForm({ name: u.name, email: u.email, phone: '', role: u.role }); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteUser(u._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
              {users.length === 0 && <Grid item xs={12}><Typography>No users found.</Typography></Grid>}
            </Grid>
          </Paper>
        )}

        {/* Departments Tab */}
        {tab === 1 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Manage Departments</Typography>
            <Box component="form" onSubmit={handleAddDept} sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? "column" : "row", flexWrap: 'wrap' }}>
              <TextField
                label="Department Name"
                value={newDept.name}
                onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Department Code (e.g., TRACK, GOV, RADIO, FUEL, VTEL, ONLINE)"
                value={newDept.code}
                onChange={e => setNewDept({ ...newDept, code: e.target.value })}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" startIcon={<AddCircleIcon />}>
                Add Department
              </Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              {Array.isArray(departments) && departments.map(dept => (
                <Grid item xs={12} sm={6} md={4} key={dept._id}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
                    <Box>
                      <Typography fontWeight={600}>{dept.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{dept.code}</Typography>
                    </Box>
                    <Box>
                      <IconButton color="primary" onClick={() => setEditingDept({ ...dept })}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteDept(dept._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
              {departments.length === 0 && <Grid item xs={12}><Typography>No departments found.</Typography></Grid>}
            </Grid>
          </Paper>
        )}

        {/* Tasks Tab */}
        {tab === 2 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Manage Tasks</Typography>
            <Button variant="contained" color="primary" startIcon={<AddCircleIcon />} sx={{ mb: 2 }} onClick={() => setAssignOpen(true)}>
              Assign New Task
            </Button>

            {assignOpen && (
              <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Assign Task</Typography>
                <Box component="form" onSubmit={handleAssignTask} sx={{ display: 'flex', flexDirection: "column", gap: 2 }}>
                  <TextField label="Title" name="title" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} required fullWidth />
                  <TextField label="Description" name="description" value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} fullWidth />
                  <FormControl fullWidth required>
                    <InputLabel>Department</InputLabel>
                    <Select name="department" value={assignForm.department} label="Department" onChange={e => setAssignForm({ ...assignForm, department: e.target.value })}>
                      <MenuItem value="">Select</MenuItem>
                      {Array.isArray(departments) && departments.map(d => (
                        <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Assign To</InputLabel>
                    <Select name="assignedTo" value={assignForm.assignedTo} label="Assign To" onChange={e => setAssignForm({ ...assignForm, assignedTo: e.target.value })}>
                      <MenuItem value="">Select</MenuItem>
                      {Array.isArray(users) && users.map(u => (
                        <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField type="date" name="deadline" label="Deadline" value={assignForm.deadline} onChange={e => setAssignForm({ ...assignForm, deadline: e.target.value })} InputLabelProps={{ shrink: true }} required />
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button type="submit" variant="contained" color="primary">Assign Task</Button>
                    <Button variant="outlined" color="secondary" onClick={() => { setAssignOpen(false); setAssignForm({ title: '', description: '', department: '', assignedTo: '', deadline: '', status: 'pending' }); }}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, flexDirection: isMobile ? "column" : "row" }}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>User</InputLabel>
                <Select value={filters.user} label="User" onChange={e => setFilters({ ...filters, user: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {Array.isArray(users) && users.map(u => (
                    <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Department</InputLabel>
                <Select value={filters.department} label="Department" onChange={e => setFilters({ ...filters, department: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {Array.isArray(departments) && departments.map(d => (
                    <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField type="date" label="Date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
              <Button onClick={() => setFilters({ user: '', department: '', date: '' })} color="secondary" variant="outlined">
                Clear Filters
              </Button>
            </Box>

            <Grid container spacing={3}>
              {Array.isArray(tasks) && tasks.map(task => (
                <Grid item xs={12} sm={6} md={4} key={task._id}>
                  <TaskCard
                    task={task}
                    onEdit={() => setEditingTask({ ...task, department: task.department?._id, assignedTo: task.assignedTo?._id })}
                    onDelete={() => handleDeleteTask(task._id)}
                  />
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

        {/* Memos Tab */}
        {tab === 3 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Broadcast Memo</Typography>
            <Box component="form" onSubmit={handleCreateMemo} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Title" value={memoForm.title} onChange={e => setMemoForm({ ...memoForm, title: e.target.value })} required />
              <TextField label="Message" value={memoForm.message} onChange={e => setMemoForm({ ...memoForm, message: e.target.value })} required multiline rows={4} />
              <Button type="submit" variant="contained" startIcon={<AddCircleIcon />}>Send Memo</Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              {Array.isArray(memos) && memos.map(m => (
                <Grid item xs={12} sm={6} md={4} key={m._id}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography fontWeight={700}>{m.title}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>{m.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      By: {m.createdBy?.name || m.createdBy?.email} — {new Date(m.createdAt).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
              {memos.length === 0 && <Grid item xs={12}><Typography>No memos yet.</Typography></Grid>}
            </Grid>
          </Paper>
        )}

        {/* Analytics Tab */}
        {tab === 4 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Analytics</Typography>
            <Filters
              filters={analyticsFilters}
              onChange={setAnalyticsFilters}
              departments={departments}
              showrooms={showrooms}
            />
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button variant="contained" onClick={fetchAnalytics}>Refresh Analytics</Button>
              <Button variant="outlined" onClick={fetchMonthly}>Load Monthly Overview</Button>
            </Stack>
            <KpiCards data={{ ...trends, submission: submissionStatus }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Trend (Activity over time)</Typography>
              <TrendLineChart data={trends.series || []} />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>By Department</Typography>
                <DeptBarChart data={byDept} deptLookup={deptLookup} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Tracking Showroom Comparison</Typography>
                <ShowroomBarChart data={trackingShowroomRollup} />
              </Grid>
            </Grid>

            {monthly && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Boss Monthly Overview (This month vs Last month)</Typography>
                <BossMonthlyPies monthly={monthly} />
              </Box>
            )}
          </Paper>
        )}

        {/* Submit Report Tab */}
        {tab === 5 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Submit / Update Daily Report</Typography>
            <ReportForm
              departments={departments}
              showrooms={showrooms}
              onSubmit={handleSubmitReport}
            />
          </Paper>
        )}

        {/* Complaints Tab */}
        {tab === 6 && (
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, mt: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Customer Complaints</Typography>
            <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mb: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Service</InputLabel>
                <Select
                  value={complaintFilter}
                  label="Filter by Service"
                  onChange={e => setComplaintFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {departments.map(d => (
                    <MenuItem key={d._id} value={d.code}>{d.name} ({d.code})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" onClick={fetchMaster}>Refresh</Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Plate/Company</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Issue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.map(c => (
                  <TableRow key={c._id} sx={complaintRowStyle(c.status)}>
                    <TableCell>{c.plateOrCompany}</TableCell>
                    <TableCell>{c.mobile}</TableCell>
                    <TableCell>
                      <Chip label={c.service} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{c.customerName || '—'}</TableCell>
                    <TableCell>{c.issue}</TableCell>
                    <TableCell>{statusChip(c.status)}</TableCell>
                    <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={() => openAssignComplaint(c)}>
                        Assign to Task
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredComplaints.length === 0 && (
                  <TableRow><TableCell colSpan={8}>No complaints found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>

      {/* Edit Department Dialog */}
      <Dialog open={!!editingDept} onClose={() => setEditingDept(null)}>
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Department Name"
            value={editingDept?.name || ''}
            onChange={e => setEditingDept({ ...editingDept, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Department Code"
            value={editingDept?.code || ''}
            onChange={e => setEditingDept({ ...editingDept, code: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingDept(null)}>Cancel</Button>
          <Button onClick={handleUpdateDept} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onClose={() => setEditingTask(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Title" value={editingTask?.title || ''} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} />
          <TextField label="Description" value={editingTask?.description || ''} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} multiline rows={3} />
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select value={editingTask?.department || ''} label="Department" onChange={e => setEditingTask({ ...editingTask, department: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {departments.map(d => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select value={editingTask?.assignedTo || ''} label="Assign To" onChange={e => setEditingTask({ ...editingTask, assignedTo: e.target.value })}>
            <MenuItem value="">Select</MenuItem>
              {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField type="date" label="Deadline" value={editingTask?.deadline ? editingTask.deadline.slice(0,10) : ''} onChange={e => setEditingTask({ ...editingTask, deadline: e.target.value })} InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={editingTask?.status || 'pending'} label="Status" onChange={e => setEditingTask({ ...editingTask, status: e.target.value })}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingTask(null)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Complaint Dialog */}
      <Dialog open={assignComplaintOpen} onClose={() => setAssignComplaintOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Complaint to Task</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={assignComplaintForm.title}
            onChange={e => setAssignComplaintForm({ ...assignComplaintForm, title: e.target.value })}
            fullWidth
          />
          <TextField
            label="Description"
            value={assignComplaintForm.description}
            onChange={e => setAssignComplaintForm({ ...assignComplaintForm, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <FormControl fullWidth required>
            <InputLabel>Department</InputLabel>
            <Select
              value={assignComplaintForm.department}
              label="Department"
              onChange={e => setAssignComplaintForm({ ...assignComplaintForm, department: e.target.value })}
            >
              <MenuItem value="">Select</MenuItem>
              {departments.map(d => (
                <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={assignComplaintForm.assignedTo}
              label="Assign To"
              onChange={e => setAssignComplaintForm({ ...assignComplaintForm, assignedTo: e.target.value })}
            >
              <MenuItem value="">Select</MenuItem>
              {users.map(u => (
                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="date"
            label="Deadline"
            value={assignComplaintForm.deadline}
            onChange={e => setAssignComplaintForm({ ...assignComplaintForm, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={assignComplaintForm.status}
              label="Status"
              onChange={e => setAssignComplaintForm({ ...assignComplaintForm, status: e.target.value })}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignComplaintOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignComplaint} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.success ? "success" : "error"} sx={{ fontWeight: 700 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperuserPanel;