const ApprovalWorkflow = require('../models/ApprovalWorkflow');

// Get all workflows for organization
exports.getApprovalWorkflows = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const { entity_type } = req.query;

    const whereClause = { organization_id: organizationId };
    if (entity_type) {
        whereClause.entity_type = entity_type;
    }

    const workflows = await ApprovalWorkflow.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: workflows });
  } catch (error) {
    console.error('Error fetching approval workflows:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new workflow
exports.createApprovalWorkflow = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    // If setting as default, unset others for same entity_type
    if (req.body.is_default && req.body.entity_type) {
        await ApprovalWorkflow.update(
            { is_default: false },
            { 
                where: { 
                    organization_id: organizationId, 
                    entity_type: req.body.entity_type, 
                    is_default: true 
                } 
            }
        );
    }

    const workflow = await ApprovalWorkflow.create({
      ...req.body,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error creating approval workflow:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update a workflow
exports.updateApprovalWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const workflow = await ApprovalWorkflow.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    // If setting as default, unset others
    if (req.body.is_default === true && workflow.entity_type) {
         await ApprovalWorkflow.update(
            { is_default: false },
            { 
                where: { 
                    organization_id: organizationId, 
                    entity_type: workflow.entity_type, 
                    is_default: true 
                } 
            }
        );
    }

    await workflow.update({
      ...req.body,
      updated_by: userId,
    });

    res.json({ success: true, data: workflow });
  } catch (error) {
    console.error('Error updating approval workflow:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete a workflow
exports.deleteApprovalWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const workflow = await ApprovalWorkflow.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    await workflow.update({ deleted_by: userId });
    await workflow.destroy();

    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting approval workflow:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
