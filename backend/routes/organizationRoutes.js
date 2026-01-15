const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all organizations (Public for Login Dropdown)
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      order: [['organization_id', 'ASC']]
    });
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new organization (Protected: Admin Only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, code, plan_type, is_active } = req.body;
    const newOrganization = await Organization.create({
      name,
      code,
      plan_type,
      is_active,
      created_by: req.user.id,
      updated_by: req.user.id
    });
    res.status(201).json({ success: true, data: newOrganization });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'This Organization Code is already used. Please choose another one.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});


// Update organization (Protected: Admin Only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, plan_type, is_active } = req.body;
    
    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(200).json({ success: false, error: 'Organization not found' });
    }

    await organization.update({ 
      name, 
      code, 
      plan_type, 
      is_active,
      updated_by: req.user.id
    });
    res.json({ success: true, data: organization });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'Organization Code already exists.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

// Delete organization (Protected: Admin Only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByPk(id);
    
    if (!organization) {
      return res.status(200).json({ success: false, error: 'Organization not found' });
    }

    // Set deleted_by before soft delete
    await organization.update({ deleted_by: req.user.id });
    await organization.destroy();
    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
});

module.exports = router;
