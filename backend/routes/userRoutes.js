const express = require('express');
const router = express.Router();
const OrganizationUser = require('../models/OrganizationUser');
const Organization = require('../models/Organization');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await OrganizationUser.findAll({
      include: Organization,
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { email, full_name, job_title, organization_id, is_org_admin, is_active } = req.body;
    const newUser = await OrganizationUser.create({
      email,
      full_name,
      job_title,
      organization_id,
      is_org_admin,
      is_active
    });
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'This Email is already associated with this Organization.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, job_title, organization_id, is_org_admin, is_active } = req.body;

    const user = await OrganizationUser.findByPk(id);
    if (!user) {
      return res.status(200).json({ success: false, error: 'User not found' });
    }

    await user.update({
      email,
      full_name,
      job_title,
      organization_id,
      is_org_admin,
      is_active
    });
    res.json({ success: true, data: user });
  } catch (err) {
     if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'Email already exists.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await OrganizationUser.findByPk(id);
    
    if (!user) {
      return res.status(200).json({ success: false, error: 'User not found' });
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
});

module.exports = router;
