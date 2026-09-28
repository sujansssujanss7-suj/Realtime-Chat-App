const Message = require('../models/Message');

// Track connected users: socketId -> username
const connectedUsers = new Map();

const chatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // --- User joins ---
    socket.on('userJoin', (username) => {
      if (!username || !username.trim()) return;
      const trimmedUsername = username.trim();
      connectedUsers.set(socket.id, trimmedUsername);

      console.log(`👤 ${trimmedUsername} joined (${socket.id})`);

      // Notify all other users
      socket.broadcast.emit('userJoined', {
        username: trimmedUsername,
        onlineCount: connectedUsers.size,
      });

      // Send current online count to the joining socket
      socket.emit('onlineCount', { count: connectedUsers.size });

      // Broadcast updated count to all
      io.emit('onlineCount', { count: connectedUsers.size });
    });

    // --- Send message ---
    socket.on('sendMessage', async (data) => {
      try {
        const { username, text } = data;

        if (!username || !username.trim()) {
          socket.emit('messageError', { message: 'Username is required' });
          return;
        }

        if (!text || !text.trim()) {
          socket.emit('messageError', { message: 'Message cannot be empty' });
          return;
        }

        if (text.trim().length > 500) {
          socket.emit('messageError', { message: 'Message is too long (max 500 characters)' });
          return;
        }

        // Save to MongoDB
        const message = new Message({
          username: username.trim(),
          text: text.trim(),
          delivered: true,
        });

        const savedMessage = await message.save();

        // Broadcast to ALL connected clients (including sender)
        io.emit('newMessage', savedMessage.toObject());

        console.log(`💬 [${savedMessage.username}]: ${savedMessage.text}`);
      } catch (error) {
        console.error('❌ Error saving message via socket:', error.message);
        socket.emit('messageError', { message: 'Failed to send message. Please try again.' });
      }
    });

    // --- Typing indicators ---
    socket.on('typing', (username) => {
      if (!username) return;
      socket.broadcast.emit('typing', { username });
    });

    socket.on('stopTyping', (username) => {
      if (!username) return;
      socket.broadcast.emit('stopTyping', { username });
    });

    // --- Message read ---
    socket.on('messageRead', ({ messageId, username }) => {
      if (!messageId) return;
      // Broadcast read receipt to all (sender can update their UI)
      io.emit('messageRead', { messageId, username });

      // Update in DB asynchronously
      Message.findByIdAndUpdate(messageId, { read: true }).catch((err) =>
        console.error('❌ Error updating read status:', err.message)
      );
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      const username = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);

      if (username) {
        console.log(`👋 ${username} disconnected (${socket.id})`);
        socket.broadcast.emit('userLeft', {
          username,
          onlineCount: connectedUsers.size,
        });
        io.emit('onlineCount', { count: connectedUsers.size });
      } else {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      }
    });

    // --- Error handling ---
    socket.on('error', (error) => {
      console.error(`❌ Socket error on ${socket.id}:`, error.message);
    });
  });
};

module.exports = chatSocket;
