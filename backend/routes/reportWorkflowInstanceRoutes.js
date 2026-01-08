const express = require('express');
const router = express.Router();
const reportWorkflowInstanceController = require('../controllers/reportWorkflowInstanceController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all workflow instances for a report
router.get('/reports/:reportId/workflow-instances', reportWorkflowInstanceController.getReportWorkflowInstances);

// Create a new workflow instance
router.post('/reports/:reportId/workflow-instances', reportWorkflowInstanceController.createReportWorkflowInstance);

// Update a workflow instance
router.put('/workflow-instances/:id', reportWorkflowInstanceController.updateReportWorkflowInstance);

// Delete a workflow instance
router.delete('/workflow-instances/:id', reportWorkflowInstanceController.deleteReportWorkflowInstance);

module.exports = router;
