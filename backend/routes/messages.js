const express = require('express');
const router = express.Router();
const { messages, conversations, notifications, users } = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET messages in a conversation
router.get('/:conversationId', verifyToken, async (req, res) => {
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

    // Fire-and-forget: create/update notification and push in real-time
    _notifyRecipient(req.app.get('io'), conversationId, senderId, message || '')
      .catch(() => {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function _notifyRecipient(io, conversationId, senderId, messageText) {
  const convo = await conversations.findOneAsync({ _id: conversationId });
  if (!convo) return;
  const receiverId = (convo.members || []).find(id => id !== senderId);
  if (!receiverId) return;

  const sender = await users.findOneAsync({ _id: senderId });
  if (!sender) return;

  // Upsert: one unread message notification per sender→recipient pair
  const existing = await notifications.findOneAsync({
    userId: receiverId, fromUserId: senderId, type: 'message', read: false,
  });

  let notif;
  if (existing) {
    await notifications.updateAsync(
      { _id: existing._id },
      { $set: { comment: messageText, createdAt: new Date() } },
    );
    notif = { ...existing, comment: messageText, createdAt: new Date() };
  } else {
    notif = await notifications.insertAsync({
      userId:          receiverId,
      fromUserId:      senderId,
      fromUsername:    sender.username || '',
      fromName:        sender.name     || '',
      fromPicture:     sender.profilePicture || '',
      type:            'message',
      postId:          '',
      postDescription: '',
      comment:         messageText,
      read:            false,
      createdAt:       new Date(),
    });
  }

  // Push in real-time to recipient's socket room
  if (io) io.to(receiverId).emit('newNotification', notif);
}

module.exports = router;
