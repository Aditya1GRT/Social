const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { users } = require('../db');

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, name, profilePicture, prefersDarkTheme, description } = req.body;

    const existing = await users.findOneAsync({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ message: 'Username or email already taken' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      email,
      password: hashed,
      name: name || username,
      profilePicture: profilePicture || 'https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png',
      prefersDarkTheme: prefersDarkTheme || false,
      description: description || '',
      followers: [],
      following: [],
      reqSent: [],
      reqRecieved: [],
      createdAt: new Date(),
    };

    const created = await users.insertAsync(newUser);
    res.status(201).json(sanitize(created));
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await users.findOneAsync({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    res.status(200).json(sanitize(user));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
