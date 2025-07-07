const express = require('express');
const http = require('http');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require('@prisma/client');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000",
  credentials: true
},
});

const prisma = new PrismaClient();
const connectedUsers = new Map();

app.use(cors());
app.use(express.json());
require('dotenv').config();

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // attach userId to socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Store the mapping
  connectedUsers.set(socket.userId, socket.id);

  socket.on('private_message', async ({ to, content }) => {
    const receiverSocketId = connectedUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message', {
        from: socket.userId,
        content,
      });
    }

    // Save to DB
    await prisma.message.create({
      data: {
        fromId: socket.userId,
        toId: to,
        content,
      },
    });
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.userId);
    console.log(`User disconnected: ${socket.userId}`);
  });
});

//endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);


  
server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
});
