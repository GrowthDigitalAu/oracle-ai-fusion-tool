const express = require('express');
const router = express.Router();
const reportVersionController = require('../controllers/reportVersionController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all versions for a report
router.get('/reports/:reportId/versions', reportVersionController.getReportVersions);

// Create a new version
router.post('/reports/:reportId/versions', reportVersionController.createReportVersion);

// Update a version
router.put('/versions/:id', reportVersionController.updateReportVersion);

// Delete a version
router.delete('/versions/:id', reportVersionController.deleteReportVersion);

module.exports = router;
