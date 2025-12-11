const express = require('express');
const {
  createTask,
  updateTaskStatus,
  getUserTasks,
  assignTask,
  filterTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { isAuthenticated, isAdminOrSuperuser } = require('../middleware/auth');
const router = express.Router();

// User routes
router.post('/add', isAuthenticated, createTask);
router.get('/my', isAuthenticated, getUserTasks);
router.patch('/:id/status', isAuthenticated, updateTaskStatus);

// Admin/Superuser routes
router.post('/assign', isAuthenticated, isAdminOrSuperuser, assignTask);
router.get('/filter', isAuthenticated, isAdminOrSuperuser, filterTasks);
router.patch('/:id', isAuthenticated, isAdminOrSuperuser, updateTask);
router.delete('/:id', isAuthenticated, isAdminOrSuperuser, deleteTask);

// Reminders for the signed-in user
router.get('/reminders', isAuthenticated, async (req, res) => {
  try {
    const tasks = await require('../models/Task').find({
      assignedTo: req.user._id,
      status: 'pending'
    }).populate('department');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

module.exports = router;