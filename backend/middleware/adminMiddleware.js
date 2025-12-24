const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Access denied: Admins only' });
  }
};

module.exports = adminMiddleware;
