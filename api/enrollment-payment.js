const { Pool } = require('pg');
const formidable = require('formidable');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;

export const config = {
  api: {
    bodyParser: false,
  },
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const authenticateToken = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('No token provided');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = async (req, res) => {
  if (req.method === 'PUT') {
    let client;
    try {
      const decoded = authenticateToken(req, res);
      req.user = decoded;

      const form = new formidable.IncomingForm({
        maxFileSize: 5 * 1024 * 1024,
        allowEmptyFiles: false,
        filter: ({ mimetype }) => mimetype && mimetype.includes('image/')
      });

      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      if (!files.receipt_image) {
        throw new Error('Receipt image is required');
      }

      const receiptImage = await fs.readFile(files.receipt_image[0].filepath);
      const enrollmentId = parseInt(fields.enrollment_id);

      if (isNaN(enrollmentId)) {
        throw new Error('Invalid enrollment ID');
      }

      client = await pool.connect();

      const result = await client.query(
        `UPDATE enrollments 
         SET enrollment_payment_receipt = $1
         WHERE enrollment_id = $2 AND student_id = $3
         RETURNING enrollment_id`,
        [receiptImage, enrollmentId, req.user.id]
      );

      if (result.rows.length === 0) {
        throw new Error('Enrollment not found or unauthorized');
      }

      // Cleanup temp file
      await fs.unlink(files.receipt_image[0].filepath);

      res.json({ 
        message: "Receipt uploaded successfully",
        enrollment_id: result.rows[0].enrollment_id
      });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ 
        error: "Failed to upload receipt",
        details: error.message 
      });
    } finally {
      if (client) client.release();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
