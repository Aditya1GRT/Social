const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'social-scoop-dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Middleware that verifies the JWT sent in the `token` header ("Bearer <jwt>").
// The frontend historically sends the header as `Barer <token>`, so we accept both spellings.
const verifyToken = (req, res, next) => {
  const header = req.headers.token || req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'You are not authenticated' });

  const parts = header.split(' ');
  const raw = parts.length > 1 ? parts[1] : parts[0];

  jwt.verify(raw, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token is not valid' });
    req.user = decoded;
    next();
  });
};

module.exports = { signToken, verifyToken, JWT_SECRET };
