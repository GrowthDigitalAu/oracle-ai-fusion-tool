const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const Organization = require('../models/Organization');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: Organization,
      order: [['id', 'ASC']]
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new role
router.post('/', async (req, res) => {
  try {
    const { name, description, is_default, organization_id } = req.body;
    const newRole = await Role.create({
      name,
      description,
      is_default,
      organization_id
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_default, organization_id } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(200).json({ success: false, error: 'Role not found' });
    }

    await role.update({ name, description, is_default, organization_id });
    res.json({ success: true, data: role });
  } catch (err) {
     if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'Role name already exists.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(200).json({ success: false, error: 'Role not found' });
    }

    await role.destroy();
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
});

module.exports = router;
