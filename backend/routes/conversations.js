const express = require('express');
const router = express.Router();
const { conversations } = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET all conversations for a user
router.get('/:userId', async (req, res) => {
  try {
    // Direct array-element equality: works in both NeDB and MongoDB
    const list = await conversations.findAsync({ members: req.params.userId });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new conversation, or return the existing one
router.post('/', verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const allConvos = await conversations.findAsync({ members: senderId });
    const found = allConvos.find(c => c.members.includes(receiverId));
    if (found) return res.status(200).json(found);

    const created = await conversations.insertAsync({
      members: [senderId, receiverId],
      createdAt: new Date(),
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
