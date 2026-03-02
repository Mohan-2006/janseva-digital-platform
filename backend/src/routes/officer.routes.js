const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const pool = require('../config/db');

// GET /api/v1/officer/applications - Get all pending applications
router.get('/applications', authenticate, authorize(['officer', 'admin']), async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20, service_type } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT a.*, u.full_name, u.email, u.phone
      FROM applications a
      JOIN users u ON a.citizen_id = u.id
      WHERE a.status = $1`;
    const params = [status];

    if (service_type) {
      query += ` AND a.service_type = $${params.length + 1}`;
      params.push(service_type);
    }

    query += ` ORDER BY a.created_at ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM applications WHERE status = $1',
      [status]
    );

    res.json({
      applications: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (err) { next(err); }
});

// GET /api/v1/officer/applications/:id - Get single application detail
router.get('/applications/:id', authenticate, authorize(['officer', 'admin']), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.full_name, u.email, u.phone, u.aadhaar_number
       FROM applications a
       JOIN users u ON a.citizen_id = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Application not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/v1/officer/applications/:id/review - Approve or reject
router.patch('/applications/:id/review', authenticate, authorize(['officer', 'admin']), async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const result = await pool.query(
      `UPDATE applications
       SET status = $1, remarks = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4 AND status = 'pending'
       RETURNING *`,
      [status, remarks, req.user.id, req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Application not found or already reviewed' });
    }

    // Create notification for citizen
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'application_update')`,
      [
        result.rows[0].citizen_id,
        `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your application #${result.rows[0].application_number} has been ${status}. ${remarks || ''}`
      ]
    );

    res.json({ message: `Application ${status} successfully`, application: result.rows[0] });
  } catch (err) { next(err); }
});

// GET /api/v1/officer/stats - Officer dashboard stats
router.get('/stats', authenticate, authorize(['officer', 'admin']), async (req, res, next) => {
  try {
    const stats = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
        COUNT(*) FILTER (WHERE reviewed_by = $1) AS reviewed_by_me
       FROM applications`,
      [req.user.id]
    );
    res.json(stats.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
