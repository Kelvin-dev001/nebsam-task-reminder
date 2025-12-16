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

// List all memos (all authenticated users)
router.get('/', isAuthenticated, async (_req, res) => {
  try {
    const memos = await Memo.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');
    res.json(memos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unseen memos for current user
router.get('/unseen', isAuthenticated, async (req, res) => {
  try {
    const memos = await Memo.find({
      $or: [
        { seenBy: { $exists: false } },
        { seenBy: { $size: 0 } },
        { 'seenBy.userId': { $ne: req.user._id } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');

    // Filter out those already seen (the $ne on array is imperfect for multi entries)
    const unseen = memos.filter(m => !(m.seenBy || []).some(s => String(s.userId) === String(req.user._id)));
    res.json(unseen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark memo as seen by current user
router.post('/:id/seen', isAuthenticated, async (req, res) => {
  try {
    await Memo.updateOne(
      { _id: req.params.id, 'seenBy.userId': { $ne: req.user._id } },
      { $push: { seenBy: { userId: req.user._id, seenAt: new Date() } } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;