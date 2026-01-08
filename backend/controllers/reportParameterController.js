const ReportParameter = require('../models/ReportParameter');
const Report = require('../models/Report');

// Get all parameters for a report
exports.getReportParameters = async (req, res) => {
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

    const parameters = await ReportParameter.findAll({
      where: { report_id: reportId },
      order: [['param_order', 'ASC']],
    });

    res.json({ success: true, data: parameters });
  } catch (error) {
    console.error('Error fetching report parameters:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new parameter
exports.createReportParameter = async (req, res) => {
  try {
    const { reportId } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    // Verify report belongs to user's organization
    const report = await Report.findOne({
      where: { id: reportId, organization_id: organizationId }
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const parameter = await ReportParameter.create({
      ...req.body,
      report_id: reportId,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: parameter });
  } catch (error) {
    console.error('Error creating parameter:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'Parameter name already exists for this report' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update a parameter
exports.updateReportParameter = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const parameter = await ReportParameter.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!parameter) {
      return res.status(404).json({ success: false, error: 'Parameter not found' });
    }

    await parameter.update({
      ...req.body,
      updated_by: userId,
    });

    res.json({ success: true, data: parameter });
  } catch (error) {
    console.error('Error updating parameter:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'Parameter name already exists for this report' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete a parameter (soft delete)
exports.deleteReportParameter = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const parameter = await ReportParameter.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!parameter) {
      return res.status(404).json({ success: false, error: 'Parameter not found' });
    }

    await parameter.update({ deleted_by: userId });
    await parameter.destroy();

    res.json({ success: true, message: 'Parameter deleted successfully' });
  } catch (error) {
    console.error('Error deleting parameter:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
