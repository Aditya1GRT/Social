const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true },
  password: { type: String, required: true },
  name:     { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  description:    { type: String, default: '' },
  prefersDarkTheme: { type: Boolean, default: false },
  followers:   { type: [String], default: [] },
  following:   { type: [String], default: [] },
  reqSent:     { type: [String], default: [] },
  reqRecieved: { type: [String], default: [] },
  createdAt:   { type: Date, default: Date.now },
});
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 },    { unique: true });

module.exports = mongoose.model('User', userSchema);
