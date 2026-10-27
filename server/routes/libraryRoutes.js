const express = require('express');
const router = express.Router();
const { getResources, addResource, deleteResource } = require('../controllers/libraryController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', getResources);
router.post('/', verifyToken, requireRole('teacher', 'admin'), addResource);
router.delete('/:id', verifyToken, requireRole('teacher', 'admin'), deleteResource);

module.exports = router;
