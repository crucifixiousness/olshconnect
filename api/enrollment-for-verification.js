const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify token
    authenticateToken(req);

    // Fetch enrollments with uploaded receipts, correct status and remarks
    const result = await pool.query(`
      SELECT 
        e.enrollment_id AS _id,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as student_name,
        p.program_name as program,
        py.year_level,
        e.enrollment_status,
        encode(e.enrollment_payment_receipt, 'base64') as proof_of_payment
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN program p ON e.program_id = p.program_id
      JOIN program_year py ON e.year_id = py.year_id
      JOIN payment_transactions pt ON e.enrollment_id = pt.enrollment_id
      WHERE e.enrollment_payment_receipt IS NOT NULL
      AND e.enrollment_status = 'For Payment'
      AND pt.remarks = 'For Enrollment'
      ORDER BY student_name ASC
    `);

    // Transform the data to match frontend expectations
    const enrollments = result.rows;
    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to fetch enrollments',
      details: error.message
    });
  }
};
