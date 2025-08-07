const Department = require('../models/Department');

exports.addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const dept = await Department.create({ name });
    res.status(201).json(dept);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    res.json(departments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};