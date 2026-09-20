require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT;

const server = http.createServer(app);

// Socket.IO for real-time notifications
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Store connected users: { userId: socketId }
const connectedUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(userId);
    logger.info(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of connectedUsers.entries()) {
      if (sid === socket.id) {
        connectedUsers.delete(uid);
        break;
      }
    }
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Export io for use in services
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Start
const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`🚀 USMS Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
};

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});