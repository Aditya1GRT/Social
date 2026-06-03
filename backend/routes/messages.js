const express = require('express');
const router = express.Router();
const { messages } = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET messages in a conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const list = await messages.findAsync({ conversationId: req.params.conversationId });
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST send a message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { conversationId, senderId, message, messageMedia, mediaType } = req.body;
    const newMsg = {
      conversationId,
      senderId,
      message: message || '',
      messageMedia: messageMedia || '',
      mediaType: mediaType || '',
      createdAt: new Date(),
    };
    const created = await messages.insertAsync(newMsg);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
