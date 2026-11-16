const express = require('express');
const router = express.Router();
const syntheticStore = require('../services/syntheticStore');

// GET /api/support/config
router.get('/config', (req, res) => {
  res.json({
    success: true,
    provider: 'Internal Database Support System',
    service: 'AdaptIQ Asian Public School Support Gateway'
  });
});

// GET /api/support/tickets - List all support tickets
router.get('/tickets', (req, res) => {
  try {
    const { status, category, assignedTo } = req.query;
    const tickets = syntheticStore.getTickets({ status, category, assignedTo });
    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/support/tickets/:id - Get ticket details
router.get('/tickets/:id', (req, res) => {
  try {
    const ticket = syntheticStore.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }
    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/support/tickets - Submit new support ticket (from Help & Feedback)
router.post('/tickets', (req, res) => {
  try {
    const {
      senderName,
      name,
      senderRole,
      role,
      senderEmail,
      email,
      studentId,
      subject,
      bugTitle,
      message,
      description,
      category,
      priority,
      assignedTo
    } = req.body;

    const ticket = syntheticStore.addTicket({
      senderName: senderName || name || 'Anonymous User',
      senderRole: senderRole || role || 'student',
      senderEmail: senderEmail || email || 'user@asianpublicschool.edu',
      studentId: studentId || null,
      subject: subject || bugTitle || 'Help & Support Request',
      message: message || description || '',
      category: category || 'GENERAL',
      priority: priority || 'MEDIUM',
      assignedTo: assignedTo || 'Mrs. Ananya Sharma'
    });

    return res.status(201).json({
      success: true,
      message: `Support ticket ${ticket.ticketNumber} created successfully.`,
      data: ticket
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// Backward compatible submission route
router.post('/submit', (req, res) => {
  try {
    const { name, email, subject, message, bugTitle, description, category } = req.body;
    const ticket = syntheticStore.addTicket({
      senderName: name || 'User',
      senderEmail: email,
      subject: subject || bugTitle || 'Support Enquiry',
      message: message || description || '',
      category: category || 'GENERAL'
    });
    return res.status(200).json({
      success: true,
      message: 'Support request recorded into internal support inbox.',
      ticketNumber: ticket.ticketNumber
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/support/tickets/:id/reply - Reply to a ticket
router.post('/tickets/:id/reply', (req, res) => {
  try {
    const { responderName, responderRole, message, newStatus } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
    }
    const ticket = syntheticStore.addTicketResponse(req.params.id, {
      responderName,
      responderRole,
      message: message.trim(),
      newStatus
    });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Response posted successfully.',
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/support/tickets/:id - Update status or assignment
router.patch('/tickets/:id', (req, res) => {
  try {
    const updates = req.body;
    const ticket = syntheticStore.updateTicket(req.params.id, updates);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully.',
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
