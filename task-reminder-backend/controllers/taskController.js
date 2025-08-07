const Task = require('../models/Task');

// For users to create their own tasks (if needed)
exports.createTask = async (req, res) => {
  try {
    const { title, description, department } = req.body;
    const task = await Task.create({
      title,
      description,
      department,
      assignedTo: req.user._id // Now uses assignedTo field
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// For users to update their own task status (mark as done)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// For users to get their own tasks
exports.getUserTasks = async (req, res) => {
  try {
    const { date } = req.query;
    let filter = { assignedTo: req.user._id };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const tasks = await Task.find(filter).populate('department');
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// For admin to assign tasks to users
exports.assignTask = async (req, res) => {
  try {
    const { title, description, department, assignedTo, deadline } = req.body;
    const task = await Task.create({
      title,
      description,
      department,
      assignedTo,
      deadline,
      status: 'pending'
    });
    // Populate assignedTo and department before sending response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('department', 'name');
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// For admin to filter/search tasks (unchanged except field name)
exports.filterTasks = async (req, res) => {
  try {
    const { user, department, date } = req.query;
    let filter = {};
    if (user) filter.assignedTo = user;
    if (department) filter.department = department;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const tasks = await Task.find(filter).populate('department assignedTo');
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};