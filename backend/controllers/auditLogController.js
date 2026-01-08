const AuditLog = require('../models/AuditLog');
const OrganizationUser = require('../models/OrganizationUser');

// Get all audit logs (with filters)
exports.getAuditLogs = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const { entity_type, entity_id, action } = req.query;

    const whereClause = { organization_id: organizationId };
    
    if (entity_type) whereClause.entity_type = entity_type;
    if (entity_id) whereClause.entity_id = entity_id;
    if (action) whereClause.action = action;

    const logs = await AuditLog.findAll({
      where: whereClause,
      include: [
        { 
          model: OrganizationUser, 
          as: 'Actor',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new audit log (Manually via API if needed, though usually internal)
exports.createAuditLog = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;
    const userId = req.user.id; // Corrected from user_id based on previous fixes

    const log = await AuditLog.create({
      ...req.body,
      organization_id: organizationId,
      changed_by: userId, // Assuming current user is the actor
      created_by: userId,
      updated_by: userId,
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get specific log
exports.getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;

    const log = await AuditLog.findOne({
      where: { id, organization_id: organizationId },
      include: [
        { 
          model: OrganizationUser, 
          as: 'Actor',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ]
    });

    if (!log) {
      return res.status(404).json({ success: false, error: 'Audit log not found' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
