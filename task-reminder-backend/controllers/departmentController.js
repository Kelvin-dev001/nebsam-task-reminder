const Department = require('../models/Department');

// Create
exports.addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const dept = await Department.create({ name });
    res.status(201).json(dept);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List
exports.listDepartments = async (_req, res) => {
  try {
    const depts = await Department.find({});
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};