const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/message', messageRoutes);

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
