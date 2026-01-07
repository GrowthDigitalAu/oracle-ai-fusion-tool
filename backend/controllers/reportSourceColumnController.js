const ReportSourceColumn = require('../models/ReportSourceColumn');
const Report = require('../models/Report');

// Get all source columns for a report
exports.getReportSourceColumns = async (req, res) => {
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

    const columns = await ReportSourceColumn.findAll({
      where: { report_id: reportId },
      order: [['column_order', 'ASC']],
    });

    res.json({ success: true, data: columns });
  } catch (error) {
    console.error('Error fetching report source columns:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new source column
exports.createReportSourceColumn = async (req, res) => {
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

    const column = await ReportSourceColumn.create({
      ...req.body,
      report_id: reportId,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: column });
  } catch (error) {
    console.error('Error creating source column:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'Column name already exists for this report' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update a source column
exports.updateReportSourceColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const column = await ReportSourceColumn.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!column) {
      return res.status(404).json({ success: false, error: 'Source column not found' });
    }

    await column.update({
      ...req.body,
      updated_by: userId,
    });

    res.json({ success: true, data: column });
  } catch (error) {
    console.error('Error updating source column:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'Column name already exists for this report' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete a source column (soft delete)
exports.deleteReportSourceColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const column = await ReportSourceColumn.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!column) {
      return res.status(404).json({ success: false, error: 'Source column not found' });
    }

    await column.update({ deleted_by: userId });
    await column.destroy();

    res.json({ success: true, message: 'Source column deleted successfully' });
  } catch (error) {
    console.error('Error deleting source column:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
