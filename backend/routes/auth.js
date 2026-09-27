const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/pool');
const { hashPassword, verifyPassword } = require('../utils/password');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

const router = express.Router();

// ---- Admin photo upload setup ----
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'admins');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${req.admin.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

function createMailTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, institutionalId, password } = req.body;
  const loginEmail = String(email || institutionalId || '').trim();

  if (!loginEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE LOWER(email) = LOWER($1) OR institutional_id = $1 LIMIT 1',
      [loginEmail]
    );
    const admin = rows[0];

    if (!admin || !verifyPassword(password, admin.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (admin.status !== 'approved') {
      return res.status(403).json({ message: 'This account is still pending Institutional Board approval.' });
    }

    const token = jwt.sign(
      { id: admin.id, institutionalId: admin.institutional_id, fullName: admin.full_name, role: admin.role, scope: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        institutionalId: admin.institutional_id,
        department: admin.department,
        role: admin.role,
        photoUrl: admin.photo_url,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error during login.' });
  }
});

// POST /api/auth/request-access
router.post('/request-access', async (req, res) => {
  const { fullName, email, department, employeeId, password } = req.body;

  if (!fullName || !email || !department || !employeeId || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }

  const mailTransport = createMailTransport();
  if (!mailTransport) {
    return res.status(503).json({ message: 'Email verification is not configured. Contact the system administrator.' });
  }

  try {
    const { rows: existingRequests } = await pool.query(
      'SELECT id FROM access_requests WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    const { rows: existingAdmins } = await pool.query(
      'SELECT id FROM admins WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (existingRequests.length > 0 || existingAdmins.length > 0) {
      return res.status(409).json({ message: 'An account or request already exists for this email.' });
    }

    const requestId = uuidv4();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    await pool.query(
      `INSERT INTO access_requests
         (id, full_name, email, department, employee_id, password_hash, status,
          email_verified, verification_token_hash, verification_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',false,$7,now() + interval '24 hours')`,
      [requestId, fullName.trim(), normalizedEmail, department, employeeId.trim(), hashPassword(password), verificationTokenHash]
    );

    const verificationUrl = new URL('/verify-email', process.env.FRONTEND_URL || 'http://localhost:5173');
    verificationUrl.searchParams.set('token', verificationToken);
    try {
      await mailTransport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: normalizedEmail,
        subject: 'Verify your Barangay Poblacion admin request',
        text: `Hello ${fullName.trim()},\n\nVerify this email address to submit your admin access request for board review:\n${verificationUrl.toString()}\n\nThis link expires in 24 hours. If you did not request access, you can ignore this message.`,
      });
    } catch (mailError) {
      await pool.query('DELETE FROM access_requests WHERE id = $1 AND email_verified = false', [requestId]);
      throw mailError;
    }

    res.status(201).json({
      message: 'A verification link has been sent to your email. Verify your address before your access request can be reviewed.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to submit the request or send its verification email.' });
  }
});

router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Verification link is invalid or expired.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  try {
    const { rows } = await pool.query(
      `UPDATE access_requests
        SET email_verified = true
       WHERE verification_token_hash = $1 AND verification_expires_at > now()
       RETURNING email`,
      [tokenHash]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Verification link is invalid, expired, or already used.' });
    }
    res.json({ message: 'Email verified. Your request is ready for Institutional Board review.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to verify this email address.' });
  }
});

router.post('/resend-verification', async (req, res) => {
  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  const mailTransport = createMailTransport();
  if (!mailTransport) {
    return res.status(503).json({ message: 'Email verification is not configured. Contact the system administrator.' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, full_name FROM access_requests
       WHERE LOWER(email) = $1 AND status = 'pending' AND email_verified = false`,
      [normalizedEmail]
    );
    if (rows.length === 0) {
      return res.json({ message: 'If an unverified access request matches this email, a new link has been sent.' });
    }

    const request = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await pool.query(
      `UPDATE access_requests SET verification_token_hash = $1,
       verification_expires_at = now() + interval '24 hours' WHERE id = $2`,
      [tokenHash, request.id]
    );
    const verificationUrl = new URL('/verify-email', process.env.FRONTEND_URL || 'http://localhost:5173');
    verificationUrl.searchParams.set('token', token);
    await mailTransport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: normalizedEmail,
      subject: 'Verify your Barangay Poblacion admin request',
      text: `Hello ${request.full_name},\n\nUse this link to verify your email address:\n${verificationUrl.toString()}\n\nThis link expires in 24 hours. If you did not request access, you can ignore this message.`,
    });
    res.json({ message: 'If an unverified access request matches this email, a new link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to send a verification email.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Institutional email is required.' });
  }

  // Always respond generically to avoid leaking which emails exist.
  res.json({
    message: 'If an account matches that institutional email, a secure reset link has been sent.',
  });
});

// ---- Account (requires a logged-in admin) ----

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, institutional_id, full_name, email, department, role, photo_url FROM admins WHERE id = $1',
      [req.admin.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Admin not found.' });

    const a = rows[0];
    res.json({
      id: a.id,
      institutionalId: a.institutional_id,
      fullName: a.full_name,
      email: a.email,
      department: a.department,
      role: a.role,
      photoUrl: a.photo_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error loading account.' });
  }
});

// POST /api/auth/me/photo  (upload/replace the logged-in admin's profile picture)
router.post('/me/photo', requireAuth, (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Unable to upload photo.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No photo file was provided.' });
    }

    try {
      const { rows: existingRows } = await pool.query('SELECT photo_url FROM admins WHERE id = $1', [req.admin.id]);
      if (existingRows.length === 0) {
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({ message: 'Admin not found.' });
      }

      const oldPhotoUrl = existingRows[0].photo_url;
      if (oldPhotoUrl) {
        const oldPath = path.join(__dirname, '..', oldPhotoUrl.replace(/^\//, ''));
        fs.unlink(oldPath, () => {});
      }

      const photoUrl = `/uploads/admins/${req.file.filename}`;
      const { rows } = await pool.query(
        'UPDATE admins SET photo_url = $1 WHERE id = $2 RETURNING id, institutional_id, full_name, email, department, role, photo_url',
        [photoUrl, req.admin.id]
      );

      const a = rows[0];
      res.json({
        id: a.id,
        institutionalId: a.institutional_id,
        fullName: a.full_name,
        email: a.email,
        department: a.department,
        role: a.role,
        photoUrl: a.photo_url,
      });
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).json({ message: 'Database error saving photo.' });
    }
  });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM admins WHERE id = $1', [req.admin.id]);
    const admin = rows[0];
    if (!admin || !verifyPassword(currentPassword, admin.password_hash)) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [
      hashPassword(newPassword),
      admin.id,
    ]);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error updating password.' });
  }
});

// ---- Access request management (requires a logged-in admin) ----

// GET /api/auth/access-requests
router.get('/access-requests', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, full_name, email, department, employee_id, requested_at
       FROM access_requests WHERE status = 'pending' AND email_verified = true ORDER BY requested_at ASC`
    );
    res.json(
      rows.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        department: r.department,
        employeeId: r.employee_id,
        requestedAt: r.requested_at,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error loading requests.' });
  }
});

// POST /api/auth/access-requests/:id/approve
router.post('/access-requests/:id/approve', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: reqRows } = await client.query(
      'SELECT * FROM access_requests WHERE id = $1',
      [req.params.id]
    );
    const request = reqRows[0];
    if (!request) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Request not found.' });
    }
    if (!request.email_verified) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'The applicant must verify their email before approval.' });
    }

    const { rows: idTakenRows } = await client.query(
      'SELECT id FROM admins WHERE institutional_id = $1',
      [request.employee_id]
    );
    if (idTakenRows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'An admin with this Employee ID already exists.' });
    }

    const newAdminId = `adm-${uuidv4().slice(0, 8)}`;
    await client.query(
      `INSERT INTO admins (id, institutional_id, full_name, email, department, password_hash, status, role)
       VALUES ($1,$2,$3,$4,$5,$6,'approved','Administrator')`,
      [newAdminId, request.employee_id, request.full_name, request.email, request.department, request.password_hash]
    );

    await client.query('DELETE FROM access_requests WHERE id = $1', [request.id]);
    await client.query('COMMIT');

    res.json({
      message: `${request.full_name} has been approved and can now log in with their email address.`,
      admin: { id: newAdminId, institutionalId: request.employee_id, fullName: request.full_name },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Database error approving request.' });
  } finally {
    client.release();
  }
});

// POST /api/auth/access-requests/:id/reject
router.post('/access-requests/:id/reject', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM access_requests WHERE id = $1 RETURNING full_name',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Request not found.' });

    res.json({ message: `Request from ${rows[0].full_name} has been rejected and removed.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error rejecting request.' });
  }
});

module.exports = router;
