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

      console.log('🔍 DEBUG: Download TOR request for ID:', tor_request_id);

      if (!tor_request_id) {
        console.log('❌ ERROR: No TOR request ID provided');
        return res.status(400).json({ error: 'TOR request ID is required' });
      }

      client = await pool.connect();

      // Get the TOR document path
      const query = `
        SELECT tor_document_path, s.first_name, s.last_name, ter.status
        FROM tor_evaluation_requests ter
        JOIN students s ON ter.student_id = s.id
        WHERE ter.id = $1
      `;
      const result = await client.query(query, [tor_request_id]);

      console.log('🔍 DEBUG: Query result:', result.rows);

      if (result.rows.length === 0) {
        console.log('❌ ERROR: TOR request not found in database');
        return res.status(404).json({ error: 'TOR request not found' });
      }

      const { tor_document_path, first_name, last_name, status } = result.rows[0];

      console.log('🔍 DEBUG: TOR request details:', {
        tor_document_path,
        first_name,
        last_name,
        status
      });

      if (!tor_document_path) {
        console.log('❌ ERROR: No TOR document path found for request');
        return res.status(404).json({ error: 'TOR document not uploaded yet' });
      }

      // Construct the full file path
      const filePath = path.join(process.cwd(), 'uploads', tor_document_path);
      
      console.log('🔍 DEBUG: Looking for file at path:', filePath);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log('❌ ERROR: File does not exist at path:', filePath);
        return res.status(404).json({ error: 'TOR file not found on server' });
      }

      console.log('✅ SUCCESS: File found, proceeding with download');

      // Set headers for file download
      const fileName = `TOR_${first_name}_${last_name}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/pdf');

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('❌ ERROR in download-tor API:', error);
      const status = error.status || 500;
      return res.status(status).json({ error: error.message || 'Server error' });
    } finally {
      if (client) client.release();
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};
