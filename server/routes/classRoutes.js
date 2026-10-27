const express = require('express');
const router = express.Router();
const { 
  createClass, 
  getMyClasses, 
  joinClass, 
  getClassById, 
  deleteClass,
  previewRoster,
  importRoster,
  resetStudentPin,
  removeStudent
} = require('../controllers/classController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getMyClasses);
router.post('/', requireRole('teacher', 'admin'), createClass);
router.post('/join', joinClass);
router.get('/:id', getClassById);
router.delete('/:id', requireRole('teacher', 'admin'), deleteClass);

// Roster Management & Preview
router.post('/:id/import-roster/preview', requireRole('teacher', 'admin'), previewRoster);
router.post('/:id/import-roster', requireRole('teacher', 'admin'), importRoster);

// Student Management & PIN Reset
router.post('/:id/students/:studentId/reset-pin', requireRole('teacher', 'admin'), resetStudentPin);
router.delete('/:id/students/:studentId', requireRole('teacher', 'admin'), removeStudent);

module.exports = router;
