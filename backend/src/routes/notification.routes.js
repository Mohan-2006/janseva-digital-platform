const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const pool = require('../config/db');

// GET /api/v1/notifications - Get user notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [req.user.id];

    if (unread_only === 'true') {
      query += ' AND is_read = false';
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({
      notifications: result.rows,
      unread_count: parseInt(countResult.rows[0].count)
    });
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Notification not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/read-all - Mark all as read
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
