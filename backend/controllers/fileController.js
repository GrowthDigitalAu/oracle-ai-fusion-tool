const File = require('../models/File');

// Get all files for organization
exports.getFiles = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const { storage_type } = req.query;

    const whereClause = { organization_id: organizationId };
    if (storage_type) {
        whereClause.storage_type = storage_type;
    }

    const files = await File.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new file record (Metadata only)
exports.createFile = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    // TODO: If actual file upload is needed here, integrate multer or similar.
    // This currently assumes metadata is passed after upload (e.g. direct S3 upload).

    const file = await File.create({
      ...req.body,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    console.error('Error creating file record:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get single file record
exports.getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;

    const file = await File.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({ success: true, data: file });
  } catch (error) {
    console.error('Error fetching file record:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update file record
exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const file = await File.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    await file.update({
      ...req.body,
      updated_by: userId,
    });

    res.json({ success: true, data: file });
  } catch (error) {
    console.error('Error updating file record:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete file record (Soft delete)
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user.id;

    const file = await File.findOne({
      where: { id, organization_id: organizationId }
    });

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    await file.update({ deleted_by: userId });
    await file.destroy();

    res.json({ success: true, message: 'File record deleted successfully' });
  } catch (error) {
    console.error('Error deleting file record:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
