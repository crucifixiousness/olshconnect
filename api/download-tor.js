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

      // Get the TOR request details and student info
      const query = `
        SELECT 
          ter.student_id,
          ter.program_id,
          ter.year_id,
          ter.semester,
          ter.status,
          s.first_name,
          s.last_name,
          s.email
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

      const { student_id, first_name, last_name, status } = result.rows[0];

      console.log('🔍 DEBUG: TOR request details:', {
        student_id,
        first_name,
        last_name,
        status
      });

      // Get the TOR document from the enrollments table
      const enrollmentQuery = `
        SELECT tor_doc, enrollment_date, academic_year, semester
        FROM enrollments 
        WHERE student_id = $1 AND tor_doc IS NOT NULL
        ORDER BY enrollment_date DESC
        LIMIT 1
      `;
      const enrollmentResult = await client.query(enrollmentQuery, [student_id]);

      console.log('🔍 DEBUG: Enrollment query result:', {
        found: enrollmentResult.rows.length > 0,
        has_tor_doc: enrollmentResult.rows.length > 0 ? !!enrollmentResult.rows[0].tor_doc : false
      });

      if (enrollmentResult.rows.length === 0 || !enrollmentResult.rows[0].tor_doc) {
        console.log('❌ ERROR: No TOR document found in enrollments table');
        return res.status(404).json({ error: 'TOR document not found in enrollment records' });
      }

      const torDocBinary = enrollmentResult.rows[0].tor_doc;
      console.log('✅ SUCCESS: TOR document found, size:', torDocBinary.length, 'bytes');

      // Set headers for file download
      const fileName = `TOR_${first_name}_${last_name}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', torDocBinary.length);

      // Send the binary data directly
      res.send(torDocBinary);

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
