const express = require('express');
const router = express.Router();
const reportAssetController = require('../controllers/reportAssetController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all assets for a report
router.get('/reports/:reportId/assets', reportAssetController.getReportAssets);

// Create a new asset
router.post('/reports/:reportId/assets', reportAssetController.createReportAsset);

// Update an asset
router.put('/assets/:id', reportAssetController.updateReportAsset);

// Delete an asset
router.delete('/assets/:id', reportAssetController.deleteReportAsset);

module.exports = router;
