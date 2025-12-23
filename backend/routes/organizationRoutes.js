const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.findAll();
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new organization
router.post('/', async (req, res) => {
  try {
    const { name, code, plan_type, tenant_id, is_active } = req.body;
    const newOrganization = await Organization.create({
      name,
      code,
      plan_type,
      tenant_id,
      is_active
    });
    res.status(201).json({ success: true, data: newOrganization });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'This Organization Code is already used. Please choose another one.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

module.exports = router;
