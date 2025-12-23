const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/auth/verify
// @desc    Verify token and return user info
// @access  Protected
router.get('/verify', authMiddleware, (req, res) => {
  // If middleware passes, token is valid
  res.json({ success: true, user: req.user });
});

module.exports = router;
