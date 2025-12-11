const express = require('express');
const {
  createTask,
  updateTaskStatus,
  getUserTasks,
  assignTask,
  filterTasks
} = require('../controllers/taskController');
const { isAuthenticated, isAdminOrSuperuser } = require('../middleware/auth');
const Task = require('../models/Task');
const router = express.Router();

// User routes
router.post('/add', isAuthenticated, createTask);
router.get('/my', isAuthenticated, getUserTasks);
router.patch('/:id/status', isAuthenticated, updateTaskStatus);

// Admin/superuser routes
router.post('/assign', isAuthenticated, isAdminOrSuperuser, assignTask);
router.get('/filter', isAuthenticated, isAdminOrSuperuser, filterTasks);

// Toast/Notification reminders route
router.get('/reminders', isAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      status: 'pending'
    }).populate('department');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

module.exports = router;