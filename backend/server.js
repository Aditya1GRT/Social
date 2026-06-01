require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');

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

// Socket.io real-time messaging
const activeUsers = [];

const addUser = (userId, socketId) => {
  if (!activeUsers.find(u => u.userId === userId)) {
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
    io.emit('getUsers', activeUsers);
  });

  socket.on('sendMessage', ({ senderId, reciverId, message }) => {
    const receiver = getUser(reciverId);
    if (receiver) {
      io.to(receiver.socketId).emit('getMessage', { senderId, message });
    }
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    io.emit('getUsers', activeUsers);
  });
});

// In a single-service deployment, serve the built React frontend.
// Only activates when a production build exists, so local two-server dev is unaffected.
const buildPath = path.join(__dirname, '..', 'TheSocialScoop-master', 'TheSocialScoop-master', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
  console.log('Serving frontend build from', buildPath);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
