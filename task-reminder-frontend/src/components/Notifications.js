import React, { useEffect } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import api from '../api';

const Notifications = ({ user }) => {
  const [open, setOpen] = React.useState(false);
  const [reminderCount, setReminderCount] = React.useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchReminders = async () => {
      try {
        const res = await api.get('/tasks/reminders', { withCredentials: true });
        if (res.data.length > 0) {
          setReminderCount(res.data.length);
          setOpen(true);
        } else {
          setOpen(false);
        }
      } catch (err) {
        setOpen(false);
      }
    };

    fetchReminders();
    const interval = setInterval(fetchReminders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={(props) => <Slide {...props} direction="down" />}
    >
      <Alert
        icon={<NotificationsActiveIcon fontSize="inherit" color="warning" />}
        onClose={handleClose}
        severity="info"
        sx={{
          bgcolor: "#e3ecfa",
          color: "#1976d2",
          fontWeight: 600,
          fontSize: "1.08rem",
          alignItems: 'center'
        }}
        variant="filled"
      >
        You have {reminderCount} pending task{reminderCount > 1 ? "s" : ""}!
      </Alert>
    </Snackbar>
  );
};

export default Notifications;