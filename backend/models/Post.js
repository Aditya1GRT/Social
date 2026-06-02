const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  description:  { type: String, default: '' },
  postMedia:    { type: String, default: 'null' },
  mediaType:    { type: String, default: '' },
  likes:        { type: [String], default: [] },
  comments:     { type: [mongoose.Schema.Types.Mixed], default: [] },
  username:     { type: String, default: '' },
  name:         { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);
