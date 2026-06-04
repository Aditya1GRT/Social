const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:      { type: String, required: true },
  fromUserId:  { type: String, required: true },
  fromUsername:{ type: String, default: '' },
  fromName:    { type: String, default: '' },
  fromPicture: { type: String, default: '' },
  type:        { type: String, enum: ['like', 'comment', 'follow', 'message', 'followRequest'], required: true },
  postId:      { type: String, default: '' },
  postDescription: { type: String, default: '' },
  comment:     { type: String, default: '' },
  read:        { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
