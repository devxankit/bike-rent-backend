const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[AuthMiddleware] No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      console.warn('[AuthMiddleware] User not found for token');
      return res.status(401).json({ message: 'User not found' });
    }
    console.log('[AuthMiddleware] Authenticated user:', req.user.email);
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Token error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    console.warn('[AuthMiddleware] Admin access denied for:', req.user?.email);
    return res.status(403).json({ message: 'Admin access required' });
  }
  console.log('[AuthMiddleware] Admin access granted for:', req.user.email);
  next();
}; 