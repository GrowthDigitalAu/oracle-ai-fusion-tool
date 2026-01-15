const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Import jwt
const OrganizationUser = require('../models/OrganizationUser');
const Organization = require('../models/Organization');
const authMiddleware = require('../middleware/authMiddleware');

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
        role: 'User', // Explicitly set role
        is_org_admin: user.is_org_admin // Add is_org_admin flag
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

// Get all users (Scoped)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let whereClause = {};

    // If NOT Admin, filter by their own Organization ID
    if (req.user.role !== 'Admin') {
      whereClause.organization_id = req.user.organization_id;
    }

    const users = await OrganizationUser.findAll({
      where: whereClause,
      include: Organization,
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new user (Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { email, full_name, job_title, organization_id, is_active } = req.body;
    
    // Auto-set is_org_admin based on Creator's Role
    // If Admin created it -> True. If User created it -> False.
    const is_org_admin = req.user.role === 'Admin';

    // If NOT Admin, force organization_id to match their own
    let finalOrgId = organization_id;
    if (req.user.role !== 'Admin') {
      finalOrgId = req.user.organization_id;
    }

    const newUser = await OrganizationUser.create({
      email,
      full_name,
      job_title,
      organization_id: finalOrgId,
      is_org_admin,
      is_active,
      created_by: req.user.id,
      updated_by: req.user.id
    });
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'This email address is already in use.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

// Update user (Protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, job_title, organization_id, is_active } = req.body; // Remove is_org_admin from update body if unauthorized? 
    // For now, let's keep it simple or restricted. 
    // If we want to allow updating is_org_admin, we should check role.
    
    // Let's assume for now updates respect the body but we could restrict is_org_admin editing to Admins only later.
    const is_org_admin = req.body.is_org_admin; // Keeping existing behavior but protected

    const user = await OrganizationUser.findByPk(id);
    if (!user) {
      return res.status(200).json({ success: false, error: 'User not found' });
    }

    await user.update({
      email,
      full_name,
      job_title,
      organization_id,
      is_active, // is_org_admin logic is separate/removed from update specifically
      updated_by: req.user.id
    });
    res.json({ success: true, data: user });
  } catch (err) {
     if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(200).json({ success: false, error: 'This email address is already in use.' });
    }
    res.status(200).json({ success: false, error: err.message });
  }
});

// Delete user (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await OrganizationUser.findByPk(id);
    
    if (!user) {
      return res.status(200).json({ success: false, error: 'User not found' });
    }

    // Set deleted_by before soft delete
    await user.update({ deleted_by: req.user.id });
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
});

module.exports = router;
