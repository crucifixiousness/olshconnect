const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function authenticateToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    const err = new Error('No token provided');
    err.status = 401;
    throw err;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error('Invalid token');
    err.status = 401;
    throw err;
  }
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    let client;
    try {
      const decoded = authenticateToken(req);
      const { tor_request_id } = req.query;

      if (!tor_request_id) {
        return res.status(400).json({ error: 'TOR request ID is required' });
      }

      client = await pool.connect();

      // Get the TOR document path
      const query = `
        SELECT tor_document_path, s.first_name, s.last_name
        FROM tor_evaluation_requests ter
        JOIN students s ON ter.student_id = s.id
        WHERE ter.id = $1
      `;
      const result = await client.query(query, [tor_request_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'TOR request not found' });
      }

      const { tor_document_path, first_name, last_name } = result.rows[0];

      if (!tor_document_path) {
        return res.status(404).json({ error: 'TOR document not found' });
      }

      // Construct the full file path
      const filePath = path.join(process.cwd(), 'uploads', tor_document_path);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'TOR file not found on server' });
      }

      // Set headers for file download
      const fileName = `TOR_${first_name}_${last_name}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/pdf');

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ error: error.message || 'Server error' });
    } finally {
      if (client) client.release();
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};
