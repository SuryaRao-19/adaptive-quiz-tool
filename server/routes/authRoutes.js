const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  pinLogin,
  getMe, 
  updateProfile, 
  changePassword 
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter, pinLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/pin-login', pinLimiter, pinLogin);
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, updateProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.put('/change-password', verifyToken, changePassword);
router.put('/password', verifyToken, changePassword);

module.exports = router;
