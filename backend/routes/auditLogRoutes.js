const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all logs (can filter by query params)
router.get('/audit-logs', auditLogController.getAuditLogs);

// Get single log
router.get('/audit-logs/:id', auditLogController.getAuditLogById);

// Create log (If exposing endpoint for frontend to log actions manually)
router.post('/audit-logs', auditLogController.createAuditLog);

module.exports = router;
