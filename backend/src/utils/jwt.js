const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_TTL = '10m';
const REFRESH_TOKEN_TTL = '7d';

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, roles: user.roles, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function signRefreshToken(userId, tokenId) {
  return jwt.sign(
    { sub: userId, jti: tokenId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = { signAccessToken, signRefreshToken, verifyToken, REFRESH_TOKEN_TTL };
