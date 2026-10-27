const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, sendMessage);
router.get('/history', verifyToken, getHistory);
router.delete('/history', verifyToken, clearHistory);

module.exports = router;
