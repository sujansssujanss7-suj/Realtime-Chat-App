const express = require('express');
const router = express.Router();
const { getMessages, createMessage, healthCheck } = require('../controllers/messageController');

router.get('/health', healthCheck);
router.get('/messages', getMessages);
router.post('/messages', createMessage);

module.exports = router;
