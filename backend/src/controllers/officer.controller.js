const db = require('../config/database');

// Get applications assigned to officer
exports.getApplications = async (req, res) => {
  try {
    const officer_id = req.user.id;
    const { status } = req.query;
    
    let query = `
      SELECT a.*, u.full_name as applicant_user_name
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.district = $1
    `;
    const params = [req.user.district];

    if (status) {
      query += ` AND a.status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY a.created_at DESC`;
    
    const result = await db.query(query, params);
    
    // Get stats
    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review')) as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM applications WHERE district = $1`,
      [req.user.district]
    );
    
    res.json({
      applications: result.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Update application status
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const officer_id = req.user.id;

    const result = await db.query(
      `UPDATE applications 
       SET status = $1, remarks = $2, assigned_officer_id = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND district = $5
       RETURNING *`,
      [status, remarks, officer_id, id, req.user.district]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    res.json({ message: 'Application updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Failed to update application' });
  }
};

module.exports = exports;
