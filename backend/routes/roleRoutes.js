const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const Organization = require('../models/Organization');
const authMiddleware = require('../middleware/authMiddleware');

// Get all roles
// Get all roles (Scoped)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let whereClause = {};

    // If NOT Admin, filter by their own Organization ID
    if (req.user.role !== 'Admin') {
      whereClause.organization_id = req.user.organization_id;
    }

    const roles = await Role.findAll({
      where: whereClause,
      include: Organization,
      order: [['id', 'ASC']]
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new role
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, is_default, organization_id } = req.body;
    
    let finalOrgId = organization_id;
    if (req.user.role !== 'Admin') {
      finalOrgId = req.user.organization_id;
    }

    const newRole = await Role.create({
      name,
      description,
      is_default,
      organization_id: finalOrgId,
      created_by: req.user.id,
      updated_by: req.user.id
    });
    res.status(201).json({ success: true, data: newRole });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'A Role with this name already exists in this Organization.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

// Update role
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_default, organization_id } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(200).json({ success: false, error: 'Role not found' });
    }

    // Check ownership for non-admins
    if (req.user.role !== 'Admin' && role.organization_id !== req.user.organization_id) {
       return res.status(403).json({ success: false, error: 'Access denied: Cannot update role from another organization' });
    }

    // Also prevent changing organization_id if not Admin
    let finalOrgId = organization_id;
    if (req.user.role !== 'Admin') {
      finalOrgId = role.organization_id; 
    }

    await role.update({ 
      name, 
      description, 
      is_default, 
      organization_id: finalOrgId,
      updated_by: req.user.id
    });
    res.json({ success: true, data: role });
  } catch (err) {
     if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'Role name already exists.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

// Delete role
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(200).json({ success: false, error: 'Role not found' });
    }

    // Check ownership for non-admins
    if (req.user.role !== 'Admin' && role.organization_id !== req.user.organization_id) {
       return res.status(403).json({ success: false, error: 'Access denied: Cannot delete role from another organization' });
    }

    // Soft delete with audit
    await role.update({ deleted_by: req.user.id });
    await role.destroy();
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
});

module.exports = router;
