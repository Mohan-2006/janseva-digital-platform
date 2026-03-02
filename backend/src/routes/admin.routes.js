const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const pool = require('../config/db');

// GET /api/v1/admin/users - List all users
router.get('/users', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT id, full_name, email, phone, role, is_verified, created_at FROM users WHERE 1=1';
    const params = [];
    if (role) { params.push(role); query += ` AND role = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length})`; }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// PATCH /api/v1/admin/users/:id/role - Change user role
router.patch('/users/:id/role', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['citizen', 'officer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, role',
      [role, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user: result.rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/v1/admin/users/:id - Deactivate user
router.delete('/users/:id', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated' });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/stats - Platform-wide statistics
router.get('/stats', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const [users, applications, services] = await Promise.all([
      pool.query('SELECT COUNT(*) total, COUNT(*) FILTER (WHERE role=\'citizen\') citizens, COUNT(*) FILTER (WHERE role=\'officer\') officers FROM users'),
      pool.query('SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status=\'pending\') pending, COUNT(*) FILTER (WHERE status=\'approved\') approved, COUNT(*) FILTER (WHERE status=\'rejected\') rejected FROM applications'),
      pool.query('SELECT COUNT(*) total, COUNT(*) FILTER (WHERE is_active=true) active FROM services')
    ]);
    res.json({
      users: users.rows[0],
      applications: applications.rows[0],
      services: services.rows[0]
    });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/services - List all services
router.get('/services', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

// POST /api/v1/admin/services - Create new service
router.post('/services', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { name, description, category, required_docs, processing_days } = req.body;
    const result = await pool.query(
      `INSERT INTO services (name, description, category, required_docs, processing_days, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, category, JSON.stringify(required_docs), processing_days, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/v1/admin/services/:id - Update service
router.patch('/services/:id', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { name, description, is_active, processing_days } = req.body;
    const result = await pool.query(
      `UPDATE services SET name=COALESCE($1,name), description=COALESCE($2,description),
       is_active=COALESCE($3,is_active), processing_days=COALESCE($4,processing_days), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, description, is_active, processing_days, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Service not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
