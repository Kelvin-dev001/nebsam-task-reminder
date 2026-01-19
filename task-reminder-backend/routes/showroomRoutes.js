const express = require('express');
const router = express.Router();
const Showroom = require('../models/Showroom');
const Department = require('../models/Department');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

// Helper to find TRACK department once (by code)
async function getTrackingDepartmentId() {
  const dept = await Department.findOne({ code: 'TRACK' }).select('_id');
  if (!dept) {
    throw new Error('Tracking department (code=TRACK) not found. Please create it first.');
  }
  return dept._id;
}

// List active showrooms
router.get('/list', isAuthenticated, async (_req, res) => {
  try {
    const showrooms = await Showroom.find({ isActive: true }).sort({ name: 1 });
    res.json(showrooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/Superuser: list all showrooms (including inactive)
router.get('/', isAuthenticated, isSuperuser, async (_req, res) => {
  try {
    const showrooms = await Showroom.find({}).sort({ name: 1 });
    res.json(showrooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/Superuser: create showroom
router.post('/', isAuthenticated, isSuperuser, async (req, res) => {
  try {
    const { name, code, isActive = true } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const trackingDeptId = await getTrackingDepartmentId();

    // If no code provided, generate one from name (e.g. "Mombasa Road" -> "MOMBASA_ROAD")
    const finalCode =
      (code && code.trim()) ||
      name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '');

    const existing = await Showroom.findOne({ code: finalCode });
    if (existing) {
      return res.status(400).json({ error: `Showroom code ${finalCode} already exists` });
    }

    const showroom = await Showroom.create({
      name: name.trim(),
      code: finalCode,
      department: trackingDeptId,
      isActive: !!isActive,
    });

    res.status(201).json(showroom);
  } catch (err) {
    console.error('Create showroom error', err);
    res.status(500).json({ error: err.message || 'Failed to create showroom' });
  }
});

// Admin/Superuser: update showroom
router.put('/:id', isAuthenticated, isSuperuser, async (req, res) => {
  try {
    const { name, code, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (code !== undefined) update.code = code.trim();
    if (isActive !== undefined) update.isActive = !!isActive;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const showroom = await Showroom.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!showroom) {
      return res.status(404).json({ error: 'Showroom not found' });
    }

    res.json(showroom);
  } catch (err) {
    console.error('Update showroom error', err);
    res.status(500).json({ error: err.message || 'Failed to update showroom' });
  }
});

// Admin/Superuser: delete showroom (soft delete: set isActive=false)
router.delete('/:id', isAuthenticated, isSuperuser, async (req, res) => {
  try {
    const showroom = await Showroom.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!showroom) {
      return res.status(404).json({ error: 'Showroom not found' });
    }
    res.json({ message: 'Showroom deactivated', showroom });
  } catch (err) {
    console.error('Delete showroom error', err);
    res.status(500).json({ error: err.message || 'Failed to delete showroom' });
  }
});

module.exports = router;