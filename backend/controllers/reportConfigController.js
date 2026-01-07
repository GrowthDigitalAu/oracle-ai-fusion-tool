const ReportConfig = require('../models/ReportConfig');
const Report = require('../models/Report');

// Get config for a report
exports.getReportConfig = async (req, res) => {
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

    const config = await ReportConfig.findOne({
      where: { report_id: reportId },
    });

    if (!config) {
      return res.status(404).json({ success: false, error: 'Config not found' });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching report config:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create or update config for a report
exports.upsertReportConfig = async (req, res) => {
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

    // Check if config already exists
    let config = await ReportConfig.findOne({
      where: { report_id: reportId }
    });

    if (config) {
      // Update existing config
      await config.update({
        config: req.body.config,
        remark: req.body.remark,
        updated_by: userId,
      });
    } else {
      // Create new config
      config = await ReportConfig.create({
        report_id: reportId,
        organization_id: organizationId,
        config: req.body.config,
        remark: req.body.remark,
        created_by: userId,
        updated_by: userId,
      });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error upserting config:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ success: false, error: 'Server error', details: error.message });
  }
};

// Delete config (soft delete)
exports.deleteReportConfig = async (req, res) => {
  try {
    const { reportId } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const config = await ReportConfig.findOne({
      where: { report_id: reportId, organization_id: organizationId }
    });

    if (!config) {
      return res.status(404).json({ success: false, error: 'Config not found' });
    }

    await config.update({ deleted_by: userId });
    await config.destroy();

    res.json({ success: true, message: 'Config deleted successfully' });
  } catch (error) {
    console.error('Error deleting config:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
