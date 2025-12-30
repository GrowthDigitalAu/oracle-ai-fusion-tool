const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const protect = require('../middleware/authMiddleware'); // Assuming this exists

// Routes for reports within a project
router.get('/projects/:projectId/reports', protect, reportController.getReportsByProject);
router.post('/projects/:projectId/reports', protect, reportController.createReport);

// Routes for individual report operations
router.put('/:id', protect, reportController.updateReport);
router.delete('/:id', protect, reportController.deleteReport);

module.exports = router;
