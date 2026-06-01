const express = require('express');
const router = express.Router();
const { conversations } = require('../db');

// GET all conversations for a user
router.get('/:userId', async (req, res) => {
  try {
    const list = await conversations.findAsync({ members: { $elemMatch: req.params.userId } });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new conversation (or return existing)
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const existing = await conversations.findOneAsync({
      members: { $size: 2, $elemMatch: senderId },
    });

    // Check if a convo with exactly these two members exists
    const allConvos = await conversations.findAsync({ members: { $elemMatch: senderId } });
    const found = allConvos.find(c => c.members.includes(receiverId));

    if (found) return res.status(200).json(found);

    const newConvo = { members: [senderId, receiverId], createdAt: new Date() };
    const created = await conversations.insertAsync(newConvo);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
