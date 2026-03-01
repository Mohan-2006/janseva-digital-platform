const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const REFRESH_COOKIE = 'janseva_rt';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, mobile, password, language } = req.body;
    const passwordHash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO users (full_name, email, mobile, password_hash, language_preference)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, full_name, email`,
      [fullName, email, mobile, passwordHash, language || 'en']
    );
    const user = result.rows[0];
    await db.query(
      `INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name='CITIZEN'`,
      [user.id]
    );
    res.status(201).json({ message: 'Registered successfully', userId: user.id });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { emailOrMobile, password } = req.body;
    const result = await db.query(
      `SELECT u.id, u.full_name, u.password_hash, u.is_active,
              ARRAY_AGG(r.name) AS roles
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE u.email=$1 OR u.mobile=$1
       GROUP BY u.id`,
      [emailOrMobile]
    );
    if (!result.rowCount) return res.status(400).json({ message: 'Invalid credentials' });
    const user = result.rows[0];
    if (!user.is_active) return res.status(403).json({ message: 'Account disabled' });
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const accessToken = signAccessToken(user);
    const tokenId = uuidv4();
    const refreshToken = signRefreshToken(user.id, tokenId);
    const tokenHash = await bcrypt.hash(refreshToken, 12);
    await db.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1,$2,$3,NOW()+interval '7 days',$4,$5)`,
      [tokenId, user.id, tokenHash, req.get('user-agent') || '', req.ip]
    );
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken, user: { id: user.id, fullName: user.full_name, roles: user.roles } });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    if (payload.type !== 'refresh') return res.status(401).json({ message: 'Invalid token type' });
    const stored = await db.query(
      `SELECT * FROM refresh_tokens WHERE id=$1 AND revoked=false`, [payload.jti]
    );
    if (!stored.rowCount) return res.status(401).json({ message: 'Refresh token not found' });
    const match = await bcrypt.compare(token, stored.rows[0].token_hash);
    if (!match) return res.status(401).json({ message: 'Token mismatch' });
    await db.query(`UPDATE refresh_tokens SET revoked=true WHERE id=$1`, [payload.jti]);
    const userResult = await db.query(
      `SELECT u.id, ARRAY_AGG(r.name) AS roles FROM users u
       JOIN user_roles ur ON u.id=ur.user_id JOIN roles r ON ur.role_id=r.id
       WHERE u.id=$1 GROUP BY u.id`, [payload.sub]
    );
    const user = userResult.rows[0];
    const newAccess = signAccessToken(user);
    const newTokenId = uuidv4();
    const newRefresh = signRefreshToken(user.id, newTokenId);
    const newHash = await bcrypt.hash(newRefresh, 12);
    await db.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1,$2,$3,NOW()+interval '7 days',$4,$5)`,
      [newTokenId, user.id, newHash, req.get('user-agent') || '', req.ip]
    );
    res.cookie(REFRESH_COOKIE, newRefresh, COOKIE_OPTIONS);
    res.json({ accessToken: newAccess });
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET);
      await db.query(`UPDATE refresh_tokens SET revoked=true WHERE id=$1`, [payload.jti]);
    }
    res.clearCookie(REFRESH_COOKIE);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE);
    res.json({ message: 'Logged out' });
  }
};

exports.me = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.full_name, u.email, u.mobile, u.language_preference,
              ARRAY_AGG(r.name) AS roles
       FROM users u JOIN user_roles ur ON u.id=ur.user_id JOIN roles r ON ur.role_id=r.id
       WHERE u.id=$1 GROUP BY u.id`, [req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
