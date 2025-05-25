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
  if (req.method === 'POST') {
    let client;
    try {
      const decoded = authenticateToken(req, res);
      req.user = decoded;

      const form = new formidable.IncomingForm({
        maxFileSize: 5 * 1024 * 1024, // 5MB limit
        allowEmptyFiles: false,
        filter: ({ mimetype }) => {
          return mimetype && mimetype.includes('image/');
        }
      });

      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      client = await pool.connect();
      await client.query('BEGIN');

      const receiptImage = files.receipt_image ? 
        await fs.readFile(files.receipt_image[0].filepath) : null;

      if (!receiptImage) {
        throw new Error('Receipt image is required');
      }

      const result = await client.query(
        `INSERT INTO enrollment_payment_receipts (enrollment_id, receipt_image)
         VALUES ($1, $2)
         RETURNING receipt_id`,
        [fields.payment_id, receiptImage]
      );

      await client.query('COMMIT');

      // Clean up temp files
      await Promise.all(Object.values(files).map(fileArray => 
        fileArray.map(file => fs.unlink(file.filepath))
      ).flat());
      
      res.json({ 
        message: "Receipt uploaded successfully",
        receipt_id: result.rows[0].receipt_id
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