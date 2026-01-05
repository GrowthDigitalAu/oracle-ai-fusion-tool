const express = require('express');
const router = express.Router();
const reportRequirementController = require('../controllers/reportRequirementController');
const protect = require('../middleware/authMiddleware');

// Get all requirements for a report
router.get('/reports/:reportId/requirements', protect, reportRequirementController.getRequirements);

// Create NEW requirement for a report
router.post('/reports/:reportId/requirements', protect, reportRequirementController.createRequirement);

// Update specific requirement
router.put('/requirements/:id', protect, reportRequirementController.updateRequirement);

// Delete specific requirement
router.delete('/requirements/:id', protect, reportRequirementController.deleteRequirement);

module.exports = router;
