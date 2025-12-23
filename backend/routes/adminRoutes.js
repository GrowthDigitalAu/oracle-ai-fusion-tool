const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await AdminUser.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: false, error: 'Invalid credentials' });
    }

    // 2. Check password (Plain text as requested)
    if (user.password_hash !== password) {
      return res.status(200).json({ success: false, error: 'Invalid credentials' });
    }

    // 3. Generate JWT Token
    // Use a secret key from env or fallback for dev
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'Admin' }, // Added role: 'Admin'
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
          full_name: user.full_name
        }
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
