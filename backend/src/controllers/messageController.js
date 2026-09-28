const Message = require('../models/Message');

/**
 * GET /api/messages
 * Fetch all chat history sorted chronologically
 */
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }).lean();
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/messages
 * Create a new message (used for REST API; real-time flow uses Socket.io)
 */
const createMessage = async (req, res, next) => {
  try {
    const { username, text } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required and cannot be empty',
      });
    }

    const message = new Message({
      username: username.trim(),
      text: text.trim(),
    });

    const savedMessage = await message.save();

    res.status(201).json({
      success: true,
      message: savedMessage,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

/**
 * GET /api/health
 * Health check endpoint
 */
const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Chat server is running',
  });
};

module.exports = { getMessages, createMessage, healthCheck };
