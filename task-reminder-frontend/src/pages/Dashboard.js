import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../api';
import TaskCard from '../components/TaskCard';
import Notifications from '../components/Notifications';
import { AuthContext } from '../contexts/AuthContext';
import ReportForm from '../components/forms/ReportForm';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  Grid,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Pagination,
  FormControlLabel,
  Switch,
  Collapse,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import logo from '../assets/logo.png';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import notifyBeep from '../assets/notify-beep.wav';

const MEMO_PAGE_SIZE = 5;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Top-level tab: 0 = Submit Report, 1 = My Reports, 2 = Memos, 3 = Tasks
  const [mainTab, setMainTab] = useState(0);

  // Memos
  const [unseenMemos, setUnseenMemos] = useState([]);
  const [allMemos, setAllMemos] = useState([]);
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [memosExpanded, setMemosExpanded] = useState(
    () => localStorage.getItem('dashboard_memos_expanded') === 'true'
  );
  const [memosPage, setMemosPage] = useState(1); // 1-based for Pagination

  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // My reports
  const [myReports, setMyReports] = useState([]);
  const [myReportsTotal, setMyReportsTotal] = useState(0);
  const [myReportsPage, setMyReportsPage] = useState(1); // 1-based
  const [myReportsRowsPerPage, setMyReportsRowsPerPage] = useState(10);
  const [myReportsFilters, setMyReportsFilters] = useState({
    startDate: '',
    endDate: '',
  });
  const [expandedReportId, setExpandedReportId] = useState(null);

  // Task tab: pending vs done
  const [taskTab, setTaskTab] = useState('pending'); // 'pending' | 'done'

  // Sound notifications
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('dashboard_sound_enabled') !== 'false'
  );
  const [lastUnseenCount, setLastUnseenCount] = useState(0);
  const [lastTaskCount, setLastTaskCount] = useState(0);
  const audioRef = useRef(null);

  const openToast = (severity, message) => setToast({ open: true, severity, message });
  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('dashboard_sound_enabled', next ? 'true' : 'false');
  };

  const fetchTasks = async () => {
    const params = filterDate ? { date: filterDate } : {};
    try {
      const res = await api.get('/tasks/my', { params, withCredentials: true });
      const arr = res.data || [];
      // Sound: new tasks appeared
      if (soundEnabled && lastTaskCount !== 0 && arr.length > lastTaskCount) {
        audioRef.current?.play().catch(() => {});
      }
      setTasks(arr);
      setLastTaskCount(arr.length);
    } catch {
      setTasks([]);
    }
  };

  const fetchUnseenMemos = async () => {
    try {
      const res = await api.get('/memos/unseen', { withCredentials: true });
      const unseen = res.data || [];
      // Sound: new unseen memos
      if (soundEnabled && lastUnseenCount !== 0 && unseen.length > lastUnseenCount) {
        audioRef.current?.play().catch(() => {});
      }
      setUnseenMemos(unseen);
      setLastUnseenCount(unseen.length);
      if (unseen.length) setMemoModalOpen(true);
    } catch {
      // ignore
    }
  };

  const fetchMemos = async () => {
    try {
      const [unseenRes, allRes] = await Promise.all([
        api.get('/memos/unseen', { withCredentials: true }),
        api.get('/memos', { withCredentials: true }),
      ]);
      const unseen = unseenRes.data || [];
      const all = allRes.data || [];

      if (soundEnabled && lastUnseenCount !== 0 && unseen.length > lastUnseenCount) {
        audioRef.current?.play().catch(() => {});
      }

      setUnseenMemos(unseen);
      setLastUnseenCount(unseen.length);
      setAllMemos(all);
      if (unseen.length) setMemoModalOpen(true);
    } catch {
      setUnseenMemos([]);
      setAllMemos([]);
    }
  };

  const fetchDepsAndShowrooms = async () => {
    try {
      const [depRes, shRes] = await Promise.all([
        api.get('/departments/list', { withCredentials: true }),
        api.get('/showrooms/list', { withCredentials: true }),
      ]);
      setDepartments(depRes.data || []);
      setShowrooms(shRes.data || []);
    } catch {
      setDepartments([]);
      setShowrooms([]);
    }
  };

  const fetchMyReports = async () => {
    try {
      const params = {
        page: myReportsPage,
        limit: myReportsRowsPerPage,
        ...myReportsFilters,
      };
      const res = await api.get('/reports/my', {
        params,
        withCredentials: true,
      });
      setMyReports(res.data.items || []);
      setMyReportsTotal(res.data.total || 0);
    } catch {
      setMyReports([]);
      setMyReportsTotal(0);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDepsAndShowrooms(),
          fetchTasks(),
          fetchMemos(),
          fetchMyReports(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [filterDate, myReportsPage, myReportsRowsPerPage, myReportsFilters]);

  // Poll unseen memos every 60s
  useEffect(() => {
    const interval = setInterval(fetchUnseenMemos, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markMemoSeen = async (id) => {
    try {
      await api.post(`/memos/${id}/seen`, {}, { withCredentials: true });
      setUnseenMemos((prev) => prev.filter((m) => m._id !== id));
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
      // Refresh my reports after submit
      setMyReportsPage(1);
      fetchMyReports();
      setMainTab(1); // switch to My Reports tab after submission
    } catch (err) {
      openToast('error', err.response?.data?.error || 'Failed to submit report');
    }
  };

  const handleMyReportsPageChange = (_event, newPage) => {
    setMyReportsPage(newPage);
  };

  const handleMyReportsRowsPerPageChange = (event) => {
    const newRows = parseInt(event.target.value, 10);
    setMyReportsRowsPerPage(newRows);
    setMyReportsPage(1);
  };

  const handleMyReportsFilterChange = (e) => {
    const { name, value } = e.target;
    setMyReportsFilters((prev) => ({ ...prev, [name]: value }));
    setMyReportsPage(1);
  };

  const handleClearReportFilters = () => {
    setMyReportsFilters({ startDate: '', endDate: '' });
    setMyReportsPage(1);
  };

  // Handle Logout with redirect
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Task filtering: Pending vs Done (for selected date)
  const visibleTasks = tasks.filter((t) => {
    if (taskTab === 'pending') {
      // Only pending & in-progress counted as "active"
      return t.status === 'pending' || t.status === 'in-progress';
    }
    // "Done" tab: only done
    return t.status === 'done';
  });

  // Memos pagination / latest memo
  const latestMemo = allMemos[0] || null;
  const totalMemoPages = Math.max(1, Math.ceil(allMemos.length / MEMO_PAGE_SIZE));
  const currentMemosPage = Math.min(memosPage, totalMemoPages);
  const pagedMemos = allMemos.slice(
    (currentMemosPage - 1) * MEMO_PAGE_SIZE,
    currentMemosPage * MEMO_PAGE_SIZE
  );

  const handleToggleMemosExpanded = () => {
    const next = !memosExpanded;
    setMemosExpanded(next);
    localStorage.setItem('dashboard_memos_expanded', next ? 'true' : 'false');
  };

  const handleMemosPageChange = (_e, page) => {
    setMemosPage(page);
  };

  const totalMyReportPages = Math.max(
    1,
    Math.ceil(myReportsTotal / myReportsRowsPerPage)
  );

  const toggleExpandedReport = (id) => {
    setExpandedReportId((prev) => (prev === id ? null : id));
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e3ecfa' }}>
      <audio ref={audioRef} src={notifyBeep} preload="auto" />
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Box sx={{ mr: 2, width: 40, height: 40 }}>
            <img
              src={logo}
              alt="Company Logo"
              style={{ width: 40, height: 40, borderRadius: 8 }}
            />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Nebsam Task Reminder
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={soundEnabled}
                onChange={handleToggleSound}
                color="secondary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {soundEnabled ? (
                  <VolumeUpIcon fontSize="small" />
                ) : (
                  <VolumeOffIcon fontSize="small" />
                )}
                <Typography variant="body2">Sound</Typography>
              </Box>
            }
            sx={{ mr: 2 }}
          />

          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user && user.name}
          </Typography>
          <IconButton color="inherit" edge="end" title="Logout" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          mt: 3,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            textAlign: 'center',
            mr: 1,
          }}
        >
          Hi Cousins <span role="img" aria-label="waving hand">👋</span>
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ mt: 2, pb: 6 }}>
        <Notifications user={user} />

        <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mb: 3 }}>
          <Tabs
            value={mainTab}
            onChange={(_, v) => setMainTab(v)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Submit Report" />
            <Tab label="My Reports" />
            <Tab label="Memos" />
            <Tab label="Tasks" />
          </Tabs>
        </Paper>

        {/* Submit Report Tab */}
        {mainTab === 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Submit / Update Daily Report
            </Typography>
            <ReportForm
              departments={departments}
              showrooms={showrooms}
              onSubmit={handleSubmitReport}
            />
          </Paper>
        )}

        {/* My Reports Tab */}
        {mainTab === 1 && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              My Reports
            </Typography>

            {/* Filters */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 2, alignItems: 'center' }}
            >
              <TextField
                type="date"
                label="Start Date"
                name="startDate"
                value={myReportsFilters.startDate}
                onChange={handleMyReportsFilterChange}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />
              <TextField
                type="date"
                label="End Date"
                name="endDate"
                value={myReportsFilters.endDate}
                onChange={handleMyReportsFilterChange}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={handleClearReportFilters}
              >
                Clear Filters
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <TextField
                select
                SelectProps={{ native: true }}
                size="small"
                label="Rows"
                value={myReportsRowsPerPage}
                onChange={handleMyReportsRowsPerPageChange}
                sx={{ width: 90 }}
              >
                {[5, 10, 20].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </TextField>
            </Stack>

            {/* Table */}
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 8, textAlign: 'left' }}>Report Date</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Submitted At</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Department</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Showroom</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Notes</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {myReports.map((r) => (
                    <React.Fragment key={r._id}>
                      <tr>
                        <td style={{ padding: 8 }}>
                          {r.reportDate
                            ? new Date(r.reportDate).toLocaleDateString()
                            : ''}
                        </td>
                        <td style={{ padding: 8 }}>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : ''}
                        </td>
                        <td style={{ padding: 8 }}>
                          {r.departmentId?.name || r.departmentId?.code || ''}
                        </td>
                        <td style={{ padding: 8 }}>
                          {r.showroomId?.name || '—'}
                        </td>
                        <td style={{ padding: 8 }}>
                          {r.notes || '—'}
                        </td>
                        <td style={{ padding: 8 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => toggleExpandedReport(r._id)}
                            startIcon={
                              expandedReportId === r._id ? (
                                <ExpandLessIcon fontSize="small" />
                              ) : (
                                <ExpandMoreIcon fontSize="small" />
                              )
                            }
                          >
                            {expandedReportId === r._id ? 'Hide' : 'View'}
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={{ padding: 0, borderBottom: '1px solid #eee' }}>
                          <Collapse in={expandedReportId === r._id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: '#f7f9ff' }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Raw Metrics (per department type)
                              </Typography>
                              <pre
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {JSON.stringify(
                                  {
                                    tracking: r.tracking,
                                    speedGovernor: r.speedGovernor,
                                    radio: r.radio,
                                    fuel: r.fuel,
                                    vehicleTelematics: r.vehicleTelematics,
                                    online: r.online,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </Box>
                          </Collapse>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                  {myReports.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>
                        No reports found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>

            {/* Pagination */}
            {totalMyReportPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Pagination
                  count={totalMyReportPages}
                  page={myReportsPage}
                  onChange={handleMyReportsPageChange}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </Paper>
        )}

        {/* Memos Tab */}
        {mainTab === 2 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Memos
              </Typography>
              <Button size="small" onClick={handleToggleMemosExpanded}>
                {memosExpanded ? 'Hide All' : 'View All'}
              </Button>
            </Box>

            {!latestMemo && (
              <Typography variant="body2" color="text.secondary">
                No memos yet.
              </Typography>
            )}

            {latestMemo && (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2, mb: memosExpanded ? 2 : 0 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mb: 0.5 }}
                >
                  Latest: {latestMemo.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {latestMemo.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  By: {latestMemo.createdBy?.name || latestMemo.createdBy?.email} —{' '}
                  {new Date(latestMemo.createdAt).toLocaleString()}
                </Typography>
              </Paper>
            )}

            {memosExpanded && allMemos.length > 1 && (
              <>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {pagedMemos.map((m) => (
                    <Paper
                      key={m._id}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 2 }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600 }}
                      >
                        {m.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, mb: 0.5 }}
                      >
                        {m.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        By: {m.createdBy?.name || m.createdBy?.email} —{' '}
                        {new Date(m.createdAt).toLocaleString()}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
                {totalMemoPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      count={totalMemoPages}
                      page={currentMemosPage}
                      onChange={handleMemosPageChange}
                      size="small"
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        )}

        {/* Tasks Tab */}
        {mainTab === 3 && (
          <>
            {/* Filter tasks by date */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Filter tasks by Date:
                </Typography>
                <TextField
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ maxWidth: 200 }}
                />
                <Button
                  onClick={() => setFilterDate('')}
                  color="secondary"
                  variant="outlined"
                  size="small"
                >
                  Clear
                </Button>
              </Box>
            </Paper>

            {/* Task tabs + list */}
            <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
              <Tabs
                value={taskTab}
                onChange={(_, v) => setTaskTab(v)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ mb: 2 }}
              >
                <Tab value="pending" label="Pending / In Progress" />
                <Tab value="done" label="Done" />
              </Tabs>

              <Grid container spacing={3}>
                {visibleTasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} key={task._id}>
                    <TaskCard task={task} onUpdate={handleUpdate} />
                  </Grid>
                ))}
                {visibleTasks.length === 0 && (
                  <Grid item xs={12}>
                    <Paper
                      sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}
                    >
                      No {taskTab === 'pending' ? 'pending' : 'done'} tasks found for
                      the selected date.
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </>
        )}
      </Container>

      {/* Memo modal for unseen memos */}
      <Dialog
        open={memoModalOpen && unseenMemos.length > 0}
        onClose={() => setMemoModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Memo</DialogTitle>
        <DialogContent dividers>
          {unseenMemos.map((m) => (
            <Box key={m._id} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {m.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                {m.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                By: {m.createdBy?.name || m.createdBy?.email} —{' '}
                {new Date(m.createdAt).toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => markMemoSeen(m._id)}
                >
                  Mark as read
                </Button>
              </Box>
            </Box>
          ))}
          {unseenMemos.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No new memos.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemoModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          sx={{ fontWeight: 700 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;