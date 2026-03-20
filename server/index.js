import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import friendshipRoutes from './routes/friendshipRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"]
  }
});

const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static storage folder
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// Make io accessible in requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/messages', messageRoutes);

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('userStatusChange', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('userStatusChange', Array.from(onlineUsers.keys()));
  });
});

httpServer.listen(port, () => {
  console.log(`Server and Sockets running at http://localhost:${port}`);
});
