const ReportVersion = require('../models/ReportVersion');
const Report = require('../models/Report');

// Get all versions for a report
exports.getReportVersions = async (req, res) => {
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

    const versions = await ReportVersion.findAll({
      where: { report_id: reportId },
      order: [['version_number', 'DESC']],
    });

    res.json({ success: true, data: versions });
  } catch (error) {
    console.error('Error fetching report versions:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new version
exports.createReportVersion = async (req, res) => {
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

    const version = await ReportVersion.create({
      ...req.body,
      report_id: reportId,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: version });
  } catch (error) {
    console.error('Error creating version:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'Version number already exists for this report' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update a version
exports.updateReportVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const version = await ReportVersion.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    await version.update({
      ...req.body,
      updated_by: userId,
    });

    res.json({ success: true, data: version });
  } catch (error) {
    console.error('Error updating version:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'Version number already exists for this report' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete a version (soft delete)
exports.deleteReportVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const version = await ReportVersion.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    await version.update({ deleted_by: userId });
    await version.destroy();

    res.json({ success: true, message: 'Version deleted successfully' });
  } catch (error) {
    console.error('Error deleting version:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
