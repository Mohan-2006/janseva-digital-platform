const db = require('../config/database');

// Get system statistics
exports.getStats = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM applications WHERE status IN ('submitted', 'under_review')) as pending,
        (SELECT COUNT(*) FROM applications WHERE status = 'approved') as approved,
        (SELECT COUNT(*) FROM applications WHERE status = 'rejected') as rejected`
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

// Get recent applications
exports.getRecentApplications = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM applications ORDER BY created_at DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, mobile, email, role, district, status, created_at 
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Update user status
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    const status = action === 'activate' ? 'active' : 'inactive';
    const result = await db.query(
      `UPDATE users SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

module.exports = exports;
