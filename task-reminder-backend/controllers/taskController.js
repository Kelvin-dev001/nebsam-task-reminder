const Task = require('../models/Task');
const Complaint = require('../models/Complaint');
const { sendSms } = require('../utils/sms');

// Helper: resolve complaint and notify customer when task is done
async function handleComplaintResolution(task) {
  if (task.complaintId && task.status === 'done') {
    const complaint = await Complaint.findById(task.complaintId);
    if (complaint && complaint.status !== 'resolved') {
      complaint.status = 'resolved';
      await complaint.save();
      await sendSms(
        complaint.mobile,
        'Your issue has been resolved. Thank you for your patience.'
      );
    }
  }
}

// For users to create their own tasks (if needed)
exports.createTask = async (req, res) => {
  try {
    const { title, description, department } = req.body;
    const task = await Task.create({
      title,
      description,
      department,
      assignedTo: req.user._id,
      assignedBy: req.user._id,
      status: 'pending'
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
    await handleComplaintResolution(task);
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

// For admin/superuser to assign tasks
exports.assignTask = async (req, res) => {
  try {
    const { title, description, department, assignedTo, deadline } = req.body;
    const task = await Task.create({
      title,
      description,
      department,
      assignedTo,
      assignedBy: req.user._id,
      deadline,
      status: 'pending'
    });
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('department', 'name');
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// For admin/superuser to filter/search tasks (now supports status & complaintId)
exports.filterTasks = async (req, res) => {
  try {
    const { user, department, date, status, complaintId } = req.query;
    let filter = {};
    if (user) filter.assignedTo = user;
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (complaintId) filter.complaintId = complaintId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    if (req.user.role === 'admin') {
      filter.assignedBy = req.user._id;
    }
    const tasks = await Task.find(filter).populate('department assignedTo assignedBy');
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// For admin/superuser to edit a task
exports.updateTask = async (req, res) => {
  try {
    const updates = req.body;
    const filter = { _id: req.params.id };
    if (req.user.role === 'admin') {
      filter.assignedBy = req.user._id;
    }
    const task = await Task.findOneAndUpdate(filter, updates, { new: true }).populate('department assignedTo assignedBy');
    if (!task) return res.status(404).json({ message: 'Task not found or not permitted' });

    if (updates.status === 'done') {
      await handleComplaintResolution(task);
    }

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// For admin/superuser to delete a task
exports.deleteTask = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'admin') {
      filter.assignedBy = req.user._id;
    }
    const task = await Task.findOneAndDelete(filter);
    if (!task) return res.status(404).json({ message: 'Task not found or not permitted' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};