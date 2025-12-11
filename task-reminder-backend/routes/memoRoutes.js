const express = require('express');
const router = express.Router();
const Memo = require('../models/Memo');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

// Broadcast memo (superuser only)
router.post('/', isAuthenticated, isSuperuser, async (req, res) => {
  try {
    const memo = await Memo.create({
      title: req.body.title,
      message: req.body.message,
      createdBy: req.user._id
    });
    const populated = await Memo.findById(memo._id).populate('createdBy', 'name email role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List memos (all authenticated users)
router.get('/', isAuthenticated, async (_req, res) => {
  try {
    const memos = await Memo.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name email role');
    res.json(memos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;