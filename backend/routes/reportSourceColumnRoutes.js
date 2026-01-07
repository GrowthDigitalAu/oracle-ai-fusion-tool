const express = require('express');
const router = express.Router();
const reportSourceColumnController = require('../controllers/reportSourceColumnController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all source columns for a report
router.get('/reports/:reportId/source-columns', reportSourceColumnController.getReportSourceColumns);

// Create a new source column
router.post('/reports/:reportId/source-columns', reportSourceColumnController.createReportSourceColumn);

// Update a source column
router.put('/source-columns/:id', reportSourceColumnController.updateReportSourceColumn);

// Delete a source column
router.delete('/source-columns/:id', reportSourceColumnController.deleteReportSourceColumn);

module.exports = router;
