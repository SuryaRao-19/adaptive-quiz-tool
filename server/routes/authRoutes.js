const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  pinLogin,
  studentLogin,
  studentActivate,
  staffLogin,
  logout,
  getMe, 
  updateProfile, 
  changePassword 
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter, pinLimiter } = require('../middleware/rateLimiter');

// Authentication routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/student-login', authLimiter, studentLogin);
router.post('/student-activate', authLimiter, studentActivate);
router.post('/staff-login', authLimiter, staffLogin);
router.post('/logout', logout);
router.post('/pin-login', pinLimiter, pinLogin);

// Protected routes
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, updateProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.put('/change-password', verifyToken, changePassword);
router.put('/password', verifyToken, changePassword);

module.exports = router;
