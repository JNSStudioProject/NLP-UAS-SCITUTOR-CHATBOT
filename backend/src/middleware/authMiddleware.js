const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../core/config');

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'MISSING_TOKEN', message: 'Missing Authorization header' } });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Access token expired' } });
    }
    return res.status(401).json({ error: { code: 'TOKEN_INVALID', message: 'Invalid token' } });
  }
};

const requireAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: { code: 'FORBIDDEN_ROLE', message: 'Admin access required' } });
  }
  next();
};

module.exports = { verifyAccessToken, requireAdminRole };
