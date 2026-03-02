const db = require('../config/database');
const { generateApplicationId } = require('../utils/helpers');

// Create new application
exports.createApplication = async (req, res) => {
  try {
    const {
      service_type, applicant_name, applicant_name_marathi,
      father_name, mother_name, date_of_birth, gender,
      mobile, email, address, district, taluka, village, pincode,
      aadhar_number, purpose, additional_info
    } = req.body;

    const user_id = req.user.id;
    const application_id = generateApplicationId();

    const result = await db.query(
      `INSERT INTO applications (
        application_id, user_id, service_type, applicant_name, applicant_name_marathi,
        father_name, mother_name, date_of_birth, gender, mobile, email, address,
        district, taluka, village, pincode, aadhar_number, purpose, additional_info, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'submitted')
      RETURNING *`,
      [application_id, user_id, service_type, applicant_name, applicant_name_marathi,
       father_name, mother_name, date_of_birth, gender, mobile, email, address,
       district, taluka, village, pincode, aadhar_number, purpose, additional_info]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      application_id,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Application creation error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

// Get application by ID (public access)
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT a.*, u.full_name as officer_name
       FROM applications a
       LEFT JOIN users u ON a.assigned_officer_id = u.id
       WHERE a.application_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch application error:', error);
    res.status(500).json({ message: 'Failed to fetch application' });
  }
};

// Get user's applications
exports.getMyApplications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await db.query(
      `SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

module.exports = exports;
