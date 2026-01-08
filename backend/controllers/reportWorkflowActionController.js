const ReportWorkflowAction = require('../models/ReportWorkflowAction');
const ReportWorkflowInstance = require('../models/ReportWorkflowInstance');
const OrganizationUser = require('../models/OrganizationUser');

// Get actions for a workflow instance
exports.getWorkflowActions = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const organizationId = req.user.organization_id;

    const instance = await ReportWorkflowInstance.findOne({
      where: { id: instanceId, organization_id: organizationId }
    });

    if (!instance) {
      return res.status(404).json({ success: false, error: 'Workflow instance not found' });
    }

    const actions = await ReportWorkflowAction.findAll({
      where: { workflow_instance_id: instanceId, organization_id: organizationId },
      include: [
        {
          model: OrganizationUser,
          as: 'Approver',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: actions });
  } catch (error) {
    console.error('Error fetching workflow actions:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new action (record an approval/rejection)
exports.createWorkflowAction = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    // Verify instance exists
    const instance = await ReportWorkflowInstance.findOne({
      where: { id: instanceId, organization_id: organizationId }
    });

    if (!instance) {
      return res.status(404).json({ success: false, error: 'Workflow instance not found' });
    }

    const action = await ReportWorkflowAction.create({
      ...req.body,
      workflow_instance_id: instanceId,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    console.error('Error creating workflow action:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get single action by ID
exports.getWorkflowActionById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;

    const action = await ReportWorkflowAction.findOne({
      where: { id, organization_id: organizationId },
      include: [
        {
          model: OrganizationUser,
          as: 'Approver',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ]
    });

    if (!action) {
      return res.status(404).json({ success: false, error: 'Action not found' });
    }

    res.json({ success: true, data: action });
  } catch (error) {
    console.error('Error fetching workflow action:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
