const express = require('express');
const router = express.Router();
const { userChat } = require('../controllers/userChatController');
const authMiddleware = require('../middleware/authMiddleware');


// GET /api/chat/:userId - get messages between logged-in user and :userId
router.get('/:userId', authMiddleware, userChat);

module.exports = router;
