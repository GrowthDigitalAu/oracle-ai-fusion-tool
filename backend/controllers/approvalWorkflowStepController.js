const ApprovalWorkflowStep = require('../models/ApprovalWorkflowStep');
const Role = require('../models/Role');

// Get steps for a workflow
exports.getWorkflowSteps = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const organizationId = req.user.organization_id;

    const steps = await ApprovalWorkflowStep.findAll({
      where: { workflow_id: workflowId, organization_id: organizationId },
      include: [
        {
          model: Role,
          attributes: ['id', 'role_name']
        }
      ],
      order: [['step_order', 'ASC']],
    });

    res.json({ success: true, data: steps });
  } catch (error) {
    console.error('Error fetching workflow steps:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new step
exports.createWorkflowStep = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const step = await ApprovalWorkflowStep.create({
      ...req.body,
      workflow_id: workflowId,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: step });
  } catch (error) {
    console.error('Error creating workflow step:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
         return res.status(400).json({ success: false, error: 'Step order must be unique for this workflow' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update a step
exports.updateWorkflowStep = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const step = await ApprovalWorkflowStep.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!step) {
      return res.status(404).json({ success: false, error: 'Step not found' });
    }

    await step.update({
      ...req.body,
      updated_by: userId,
    });

    res.json({ success: true, data: step });
  } catch (error) {
    console.error('Error updating workflow step:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
         return res.status(400).json({ success: false, error: 'Step order must be unique for this workflow' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete a step
exports.deleteWorkflowStep = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const step = await ApprovalWorkflowStep.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!step) {
      return res.status(404).json({ success: false, error: 'Step not found' });
    }

    await step.update({ deleted_by: userId });
    await step.destroy();

    res.json({ success: true, message: 'Step deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow step:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
