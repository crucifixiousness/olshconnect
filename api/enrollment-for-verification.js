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

    // Fetch enrollments with uploaded receipts and "For Enrollment" status
    const result = await pool.query(`
      SELECT 
        e.enrollment_id,
        CONCAT(s.first_name, ' ', s.middle_name, ' ', s.last_name) as student_name,
        p.program_name as program,
        py.year_level,
        e.enrollment_status,
        e.enrollment_payment_receipt as proof_of_payment
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN program p ON e.program_id = p.program_id
      JOIN program_year py ON e.year_id = py.year_id
      WHERE e.remarks = 'For Enrollment'
      AND e.enrollment_payment_receipt IS NOT NULL
      ORDER BY student_name ASC
    `);

    // Transform the data to match frontend expectations
    const enrollments = result.rows.map(row => ({
      _id: row.enrollment_id,
      studentName: row.student_name,
      program: row.program,
      yearLevel: row.year_level,
      enrollmentStatus: row.enrollment_status,
      proofOfPayment: row.proof_of_payment
    }));

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};