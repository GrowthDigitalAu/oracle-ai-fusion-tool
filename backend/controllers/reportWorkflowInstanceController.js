const ReportWorkflowInstance = require('../models/ReportWorkflowInstance');
const Report = require('../models/Report');

// Get all workflow instances for a report
exports.getReportWorkflowInstances = async (req, res) => {
  try {
    const { reportId } = req.params;
    const organizationId = req.user.organization_id;

    // Verify report belongs to user's organization
    const report = await Report.findOne({
      where: { id: reportId, organization_id: organizationId }
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const instances = await ReportWorkflowInstance.findAll({
      where: { report_id: reportId },
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: instances });
  } catch (error) {
    console.error('Error fetching workflow instances:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new workflow instance
exports.createReportWorkflowInstance = async (req, res) => {
  try {
    const { reportId } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    // Verify report belongs to user's organization
    const report = await Report.findOne({
      where: { id: reportId, organization_id: organizationId }
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const instance = await ReportWorkflowInstance.create({
      ...req.body,
      report_id: reportId,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: instance });
  } catch (error) {
    console.error('Error creating workflow instance:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update a workflow instance
exports.updateReportWorkflowInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const instance = await ReportWorkflowInstance.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!instance) {
      return res.status(404).json({ success: false, error: 'Workflow instance not found' });
    }

    await instance.update({
      ...req.body,
      updated_by: userId,
    });

    res.json({ success: true, data: instance });
  } catch (error) {
    console.error('Error updating workflow instance:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete a workflow instance (soft delete)
exports.deleteReportWorkflowInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const instance = await ReportWorkflowInstance.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!instance) {
      return res.status(404).json({ success: false, error: 'Workflow instance not found' });
    }

    await instance.update({ deleted_by: userId });
    await instance.destroy();

    res.json({ success: true, message: 'Workflow instance deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow instance:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
