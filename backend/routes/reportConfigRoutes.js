const express = require('express');
const router = express.Router();
const reportConfigController = require('../controllers/reportConfigController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get config for a report
router.get('/reports/:reportId/config', reportConfigController.getReportConfig);

// Create or update config for a report
router.post('/reports/:reportId/config', reportConfigController.upsertReportConfig);
router.put('/reports/:reportId/config', reportConfigController.upsertReportConfig);

// Delete config
router.delete('/reports/:reportId/config', reportConfigController.deleteReportConfig);

module.exports = router;
