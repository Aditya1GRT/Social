const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  senderId:       { type: String, required: true },
  message:        { type: String, default: '' },
  messageMedia:   { type: String, default: '' },
  mediaType:      { type: String, default: '' },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
