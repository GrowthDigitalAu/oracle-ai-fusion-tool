const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const Organization = require('../models/Organization');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: Organization
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

module.exports = router;
