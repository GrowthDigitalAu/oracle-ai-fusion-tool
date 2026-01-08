const express = require('express');
const router = express.Router();
const reportWorkflowActionController = require('../controllers/reportWorkflowActionController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all actions for a specific workflow instance
router.get('/workflow-instances/:instanceId/actions', reportWorkflowActionController.getWorkflowActions);

// Create action for a specific workflow instance
router.post('/workflow-instances/:instanceId/actions', reportWorkflowActionController.createWorkflowAction);

// Get single action details
router.get('/workflow-actions/:id', reportWorkflowActionController.getWorkflowActionById);

module.exports = router;
