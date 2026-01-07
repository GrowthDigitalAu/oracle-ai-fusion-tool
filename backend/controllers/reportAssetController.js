const ReportAsset = require('../models/ReportAsset');
const Report = require('../models/Report');

// Get all assets for a report
exports.getReportAssets = async (req, res) => {
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

    const assets = await ReportAsset.findAll({
      where: { report_id: reportId },
      order: [['asset_type', 'ASC'], ['version', 'DESC']],
    });

    res.json({ success: true, data: assets });
  } catch (error) {
    console.error('Error fetching report assets:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new asset
exports.createReportAsset = async (req, res) => {
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

    const asset = await ReportAsset.create({
      ...req.body,
      report_id: reportId,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    console.error('Error creating asset:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'An active asset of this type already exists for this report' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update an asset
exports.updateReportAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const asset = await ReportAsset.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    await asset.update({
      ...req.body,
      updated_by: userId,
    });

    res.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error updating asset:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'An active asset of this type already exists for this report' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete an asset (soft delete)
exports.deleteReportAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.user_id;

    const asset = await ReportAsset.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    await asset.update({ deleted_by: userId });
    await asset.destroy();

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
