require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const messageRoutes = require('./routes/messageRoutes');
const chatSocket = require('./sockets/chatSocket');
const errorHandler = require('./middleware/errorHandler');

// --- CORS Origin Resolution ---
// CLIENT_URL can be a single origin or a comma-separated list.
// In production on Render, set CLIENT_URL to your deployed frontend URL(s).
// For a React Native / Expo mobile app, CORS is not enforced by the client,
// so '*' is safe. For web clients, set CLIENT_URL explicitly.
const resolveOrigin = () => {
  const raw = process.env.CLIENT_URL;
  if (!raw || raw === '*') return '*';
  const origins = raw.split(',').map((o) => o.trim());
  return origins.length === 1 ? origins[0] : origins;
};

const corsOrigin = resolveOrigin();

const corsOptions = {
  origin: corsOrigin,
  methods: ['GET', 'POST'],
};

// --- App Setup ---
const app = express();
const httpServer = http.createServer(app);

// --- Socket.io Setup ---
const io = new Server(httpServer, {
  cors: corsOptions,
  // Keep both transports: websocket for performance, polling as fallback.
  // Render supports WebSockets natively — no extra config needed.
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// --- Connect to MongoDB ---
connectDB();

// --- Middleware ---
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api', messageRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --- Centralized Error Handler ---
app.use(errorHandler);

// --- Socket.io ---
chatSocket(io);

// --- Start Server ---
// Bind to 0.0.0.0 so Render (and other PaaS hosts) can route traffic to the process.
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS origin: ${JSON.stringify(corsOrigin)}`);
});

// --- Graceful Shutdown ---
// Render sends SIGTERM before stopping a container. Close cleanly to avoid
// dropped connections and allow in-flight requests to finish.
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  httpServer.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });

  // Force-exit after 10 s if connections are still open
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  httpServer.close(() => process.exit(1));
});
