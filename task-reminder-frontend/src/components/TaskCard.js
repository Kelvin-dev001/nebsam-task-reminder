import React from 'react';
import {
  Card, CardContent, CardActions, Typography, Button, Chip, Box, Tooltip, Divider
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const statusColor = {
  pending: "warning",
  done: "info"
};

const statusIcon = {
  pending: <PendingActionsIcon fontSize="small" color="warning" />,
  done: <DoneIcon fontSize="small" color="info" />
};

const TaskCard = ({ task, onUpdate }) => (
  <Card
    elevation={4}
    sx={{
      borderRadius: 3,
      bgcolor: "#f5faff",
      position: "relative",
      minHeight: 230,
      display: "flex",
      flexDirection: "column"
    }}
  >
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        {task.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {task.description}
      </Typography>
      <Divider sx={{ mb: 1, mt: 1 }} />
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <b>Department:</b> {task.department?.name}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <b>Assigned To:</b> {task.assignedTo?.name || task.assignedTo?.email}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <b>Deadline:</b> {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Chip
          icon={statusIcon[task.status] || null}
          label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          color={statusColor[task.status] || "default"}
          variant="filled"
          size="small"
          sx={{ mr: 1, fontWeight: 700 }}
        />
        <Typography variant="caption" color="text.secondary">
          {new Date(task.createdAt).toLocaleString()}
        </Typography>
      </Box>
    </CardContent>
    <CardActions sx={{ pt: 0, pb: 2, px: 2, justifyContent: "flex-end" }}>
      {onUpdate && task.status === 'pending' && (
        <Tooltip title="Mark this task as done">
          <Button
            onClick={() => onUpdate(task._id, 'done')}
            variant="contained"
            color="info"
            size="small"
            endIcon={<DoneIcon />}
            sx={{ borderRadius: 2 }}
          >
            Mark as Done
          </Button>
        </Tooltip>
      )}
    </CardActions>
  </Card>
);

export default TaskCard;