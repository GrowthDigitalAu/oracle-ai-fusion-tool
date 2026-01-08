const express = require('express');
const router = express.Router();
const approvalWorkflowController = require('../controllers/approvalWorkflowController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all workflows
router.get('/approval-workflows', approvalWorkflowController.getApprovalWorkflows);

// Create new workflow
router.post('/approval-workflows', approvalWorkflowController.createApprovalWorkflow);

// Update workflow
router.put('/approval-workflows/:id', approvalWorkflowController.updateApprovalWorkflow);

// Delete workflow
router.delete('/approval-workflows/:id', approvalWorkflowController.deleteApprovalWorkflow);

module.exports = router;
