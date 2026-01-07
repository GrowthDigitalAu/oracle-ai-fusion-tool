const express = require('express');
const router = express.Router();
const reportParameterController = require('../controllers/reportParameterController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all parameters for a report
router.get('/reports/:reportId/parameters', reportParameterController.getReportParameters);

// Create a new parameter
router.post('/reports/:reportId/parameters', reportParameterController.createReportParameter);

// Update a parameter
router.put('/parameters/:id', reportParameterController.updateReportParameter);

// Delete a parameter
router.delete('/parameters/:id', reportParameterController.deleteReportParameter);

module.exports = router;
