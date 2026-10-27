const express = require('express');
const router = express.Router();
const {
  getGatewayHealth,
  reconcileGatewayEvents,
  getQuarantinedAttempts
} = require('../controllers/gatewayController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public health check and gateway discovery (for local LAN student devices)
router.get('/health', getGatewayHealth);

// Authenticated reconciliation endpoint (student or teacher can sync local events)
router.post('/reconcile', verifyToken, reconcileGatewayEvents);

// Teacher/Admin review of quarantined attempts
router.get('/quarantine', verifyToken, requireRole('teacher', 'admin'), getQuarantinedAttempts);

module.exports = router;
