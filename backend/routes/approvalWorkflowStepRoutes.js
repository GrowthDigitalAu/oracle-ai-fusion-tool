const express = require('express');
const router = express.Router();
const approvalWorkflowStepController = require('../controllers/approvalWorkflowStepController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all steps for a workflow
router.get('/approval-workflows/:workflowId/steps', approvalWorkflowStepController.getWorkflowSteps);

// Create new step
router.post('/approval-workflows/:workflowId/steps', approvalWorkflowStepController.createWorkflowStep);

// Update step
router.put('/approval-workflow-steps/:id', approvalWorkflowStepController.updateWorkflowStep);

// Delete step
router.delete('/approval-workflow-steps/:id', approvalWorkflowStepController.deleteWorkflowStep);

module.exports = router;
