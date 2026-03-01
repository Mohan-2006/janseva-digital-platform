const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// File upload config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/v1/services
router.get('/services', auth(), async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM services WHERE is_active=true ORDER BY name_en`);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/v1/services/:id
router.get('/services/:id', auth(), async (req, res, next) => {
  try {
    const svc = await db.query(`SELECT * FROM services WHERE id=$1`, [req.params.id]);
    if (!svc.rowCount) return res.status(404).json({ message: 'Service not found' });
    const docs = await db.query(`SELECT * FROM service_required_docs WHERE service_id=$1`, [req.params.id]);
    res.json({ ...svc.rows[0], requiredDocs: docs.rows });
  } catch (err) { next(err); }
});

// POST /api/v1/applications
router.post('/applications', auth(), requireRole('CITIZEN'), async (req, res, next) => {
  try {
    const { serviceId, citizenData } = req.body;
    const appNum = `JANSEVA-${Date.now()}`;
    const result = await db.query(
      `INSERT INTO applications (citizen_id, service_id, application_number, citizen_data)
       VALUES ($1,$2,$3,$4) RETURNING id, application_number, status, submitted_at`,
      [req.user.id, serviceId, appNum, JSON.stringify(citizenData)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// GET /api/v1/applications
router.get('/applications', auth(), requireRole('CITIZEN'), async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT a.*, s.name_en, s.name_hi FROM applications a
       JOIN services s ON a.service_id=s.id
       WHERE a.citizen_id=$1 ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/v1/applications/:id
router.get('/applications/:id', auth(), async (req, res, next) => {
  try {
    const app = await db.query(
      `SELECT a.*, s.name_en, s.name_hi FROM applications a
       JOIN services s ON a.service_id=s.id WHERE a.id=$1`,
      [req.params.id]
    );
    if (!app.rowCount) return res.status(404).json({ message: 'Application not found' });
    const docs = await db.query(`SELECT * FROM application_documents WHERE application_id=$1`, [req.params.id]);
    res.json({ ...app.rows[0], documents: docs.rows });
  } catch (err) { next(err); }
});

// POST /api/v1/applications/:id/documents
router.post('/applications/:id/documents', auth(), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await db.query(
      `INSERT INTO application_documents (application_id, doc_type, file_path)
       VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, req.body.docType || 'DOCUMENT', req.file.path]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// GET /api/v1/notifications
router.get('/notifications', auth(), async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/notifications/:id/read', auth(), async (req, res, next) => {
  try {
    await db.query(`UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) { next(err); }
});

module.exports = router;
