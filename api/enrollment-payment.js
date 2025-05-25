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
        filter: ({ mimetype }) => {
          return mimetype && mimetype.includes('image/');
        }
      });

      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(new Error(`File upload error: ${err.message}`));
          resolve([fields, files]);
        });
      });

      client = await pool.connect();
      await client.query('BEGIN');

      const receiptImage = files.receipt_image ? 
        await fs.readFile(files.receipt_image[0].filepath) : null;

      if (!receiptImage) {
        throw new Error('Receipt image is required. Please select an image file.');
      }

      const enrollmentId = parseInt(fields.enrollment_id);
      if (isNaN(enrollmentId)) {
        throw new Error('Invalid enrollment ID format. Please try again.');
      }

      // Check if enrollment exists and belongs to the student
      const enrollmentCheck = await client.query(
        'SELECT enrollment_id FROM enrollments WHERE enrollment_id = $1 AND student_id = $2',
        [enrollmentId, req.user.id]
      );

      if (enrollmentCheck.rows.length === 0) {
        throw new Error('Enrollment not found or you do not have permission to update it.');
      }

      // Update enrollment with receipt image
      const result = await client.query(
        `UPDATE enrollments 
         SET enrollment_payment_receipt = $1,
             payment_status = 'Pending Verification'
         WHERE enrollment_id = $2 AND student_id = $3
         RETURNING enrollment_id`,
        [receiptImage, enrollmentId, req.user.id]
      );

      await client.query('COMMIT');

      // Clean up temp files
      await Promise.all(Object.values(files).map(fileArray => 
        fileArray.map(file => fs.unlink(file.filepath))
      ).flat());
      
      res.json({ 
        message: "Receipt uploaded successfully",
        enrollment_id: result.rows[0].enrollment_id
      });
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error("Error uploading receipt:", error);
      res.status(500).json({ 
        error: "Failed to upload receipt",
        details: error.message 
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
