const Task = require('../models/Task');
const User = require('../models/User');
const Department = require('../models/Department');

exports.approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = 'approved';
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.filterTasks = async (req, res) => {
  try {
    const { user, department, date } = req.query;
    let filter = {};
    if (user) filter.user = user;
    if (department) filter.department = department;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const tasks = await Task.find(filter).populate('user department');
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};