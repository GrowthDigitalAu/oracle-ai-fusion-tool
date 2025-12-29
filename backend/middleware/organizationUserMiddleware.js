const organizationUserMiddleware = (req, res, next) => {
  // Check if req.user exists (populated by authMiddleware) and if role is 'User'
  if (req.user && req.user.role === 'User') {
    next();
  } else {
    // If Admin or undefined role trying to access org user specific route
    return res.status(403).json({ success: false, error: 'Access denied. Organization Users only.' });
  }
};

module.exports = organizationUserMiddleware;
