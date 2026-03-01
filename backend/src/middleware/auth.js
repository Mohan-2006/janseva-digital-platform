const jwt = require('jsonwebtoken');

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      if (!required) return next();
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.type !== 'access') {
        return res.status(401).json({ message: 'Invalid token type' });
      }
      req.user = { id: payload.sub, roles: payload.roles };
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = auth;
