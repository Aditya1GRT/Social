const express = require('express');
const router = express.Router();
const { notifications } = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const items = await notifications.findAsync({ userId: req.params.userId });
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(items.slice(0, 50));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/read/:userId', verifyToken, async (req, res) => {
  try {
    const unread = await notifications.findAsync({ userId: req.params.userId, read: false });
    await Promise.all(unread.map(n =>
      notifications.updateAsync({ _id: n._id }, { $set: { read: true } })
    ));
    res.status(200).json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
