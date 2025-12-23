const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Import jwt
const OrganizationUser = require('../models/OrganizationUser');
const Organization = require('../models/Organization');

// Organization User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, organization_code } = req.body; // Accept organization_code
    console.log('Login Attempt:', { email, organization_code });

    // 1. Check if user exists
    // We can also verify if the user belongs to the org with checking the code
    const user = await OrganizationUser.findOne({ 
      where: { email },
      include: [{
        model: Organization,
        where: { code: organization_code } // Verify Org Code matches the User's Org
      }]
    });

    if (!user) {
      console.log('User not found or Org Code mismatch');
      // It basically means either user not found OR user doesn't belong to that Org Code
      return res.status(200).json({ success: false, error: 'Invalid credentials or Organization Code' });
    }

    console.log('User found:', user.email);
    console.log('DB Password:', user.password_hash);
    console.log('Input Password:', password);

    // 2. Check password (Plain text as current Admin implementation)
    // Note: In production, verify hash!
    if (user.password_hash !== password) {
      console.log('Password mismatch');
      return res.status(200).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.is_active) {
       return res.status(200).json({ success: false, error: 'Account is inactive' });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        organization_id: user.organization_id,
        role: 'User' // Explicitly set role
      },
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          organization_id: user.organization_id
        }
      }
    });

  } catch (err) {
    console.error('Org User Login Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

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
