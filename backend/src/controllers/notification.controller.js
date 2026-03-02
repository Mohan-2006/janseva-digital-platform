const db = require('../config/database');

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { user_id, application_id, message, type } = req.body;
    
    const result = await db.query(
      `INSERT INTO notifications (user_id, application_id, message, type, read)
       VALUES ($1, $2, $3, $4, false) RETURNING *`,
      [user_id, application_id, message, type]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [user_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const result = await db.query(
      `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ message: 'Failed to mark notification' });
  }
};

module.exports = exports;
