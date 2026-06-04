require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// Fail buffered DB operations after 8 s so API requests return 503 quickly
// instead of hanging forever when MongoDB is slow to connect or misconfigured.
mongoose.set('bufferTimeoutMS', 8000);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Trust the platform proxy (Render/Heroku/etc.) so req.protocol reflects HTTPS,
// which keeps generated upload URLs on https and avoids mixed-content blocking.
app.set('trust proxy', true);

// Expose io to route handlers via req.app.get('io')
app.set('io', io);

app.use(cors());
app.use(express.json());

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'social-scoop-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io real-time messaging
const activeUsers = [];

const addUser = (userId, socketId) => {
  const existing = activeUsers.find(u => u.userId === userId);
  if (existing) {
    existing.socketId = socketId;
  } else {
    activeUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  const idx = activeUsers.findIndex(u => u.socketId === socketId);
  if (idx !== -1) activeUsers.splice(idx, 1);
};

const getUser = (userId) => activeUsers.find(u => u.userId === userId);

io.on('connection', (socket) => {
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    socket.join(userId);  // enables io.to(userId).emit() from route handlers
    io.emit('getUsers', activeUsers);
  });

  socket.on('sendMessage', ({ senderId, reciverId, message, messageMedia, mediaType }) => {
    const receiver = getUser(reciverId);
    if (receiver) {
      io.to(receiver.socketId).emit('getMessage', { senderId, message, messageMedia, mediaType });
    }
  });

  // WebRTC signaling
  socket.on('callUser', ({ to, from, fromName, fromPicture, offer, callType }) => {
    const receiver = getUser(to);
    if (receiver) io.to(receiver.socketId).emit('incomingCall', { from, fromName, fromPicture, offer, callType });
  });

  socket.on('answerCall', ({ to, answer }) => {
    const caller = getUser(to);
    if (caller) io.to(caller.socketId).emit('callAccepted', { answer });
  });

  socket.on('iceCandidate', ({ to, candidate }) => {
    const user = getUser(to);
    if (user) io.to(user.socketId).emit('iceCandidate', { candidate });
  });

  socket.on('endCall', ({ to }) => {
    const user = getUser(to);
    if (user) io.to(user.socketId).emit('callEnded');
  });

  socket.on('rejectCall', ({ to }) => {
    const user = getUser(to);
    if (user) io.to(user.socketId).emit('callRejected');
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    io.emit('getUsers', activeUsers);
  });
});

// In a single-service deployment, serve the built Vite frontend.
// Only activates when a production build exists, so local two-server dev is unaffected.
const buildPath = path.join(__dirname, '..', 'app', 'dist');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
  console.log('Serving frontend build from', buildPath);
}

const PORT = process.env.PORT || 5000;

// Start listening immediately so the platform health check passes even while
// the database is still connecting (or is misconfigured). A DB problem should
// degrade the app, not take the whole service down on deploy.
server.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));

// Connect to MongoDB when configured. Mongoose buffers queries until the
// connection is ready, so the app recovers automatically once the URI / Atlas
// network access is correct — no redeploy needed for a network-access change.
if (process.env.MONGODB_URI) {
  const connect = () =>
    mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .then(() => console.log('Connected to MongoDB (durable storage)'))
      .catch((err) => {
        console.error('MongoDB connection failed:', err.message);
        console.error('Check MONGODB_URI is correct and that Atlas Network Access allows 0.0.0.0/0. Retrying in 5s...');
        setTimeout(connect, 5000);
      });
  connect();
} else {
  console.warn('MONGODB_URI not set — using NeDB file storage (data is lost on process restart)');
  console.warn('Set MONGODB_URI to a free MongoDB Atlas cluster for persistent storage.');
}
