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

    // Debug query to check data
    const debugResult = await pool.query(`
      SELECT COUNT(*) as total_count
      FROM enrollments e
      LEFT JOIN payment_transactions pt ON e.enrollment_id = pt.enrollment_id
      WHERE e.enrollment_status = 'For Payment'
    `);
    console.log('Debug - Total For Payment enrollments:', debugResult.rows[0].total_count);

    const debugResult2 = await pool.query(`
      SELECT COUNT(*) as total_count
      FROM enrollments e
      LEFT JOIN payment_transactions pt ON e.enrollment_id = pt.enrollment_id
      WHERE e.enrollment_status = 'For Payment'
      AND pt.remarks = 'For Enrollment'
    `);
    console.log('Debug - Total matching enrollments:', debugResult2.rows[0].total_count);

    // Main query with exact field names matching frontend
    const result = await pool.query(`
      SELECT DISTINCT
        e.enrollment_id AS "_id",
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as "studentName",
        p.program_name as "program",
        py.year_level as "yearLevel",
        e.enrollment_status as "enrollmentStatus",
        encode(e.enrollment_payment_receipt, 'base64') as "proofOfPayment"
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN program p ON e.program_id = p.program_id
      JOIN program_year py ON e.year_id = py.year_id
      JOIN payment_transactions pt ON e.enrollment_id = pt.enrollment_id
      WHERE e.enrollment_payment_receipt IS NOT NULL
      AND e.enrollment_status = 'For Payment'
      AND pt.remarks = 'For Enrollment'
      ORDER BY "studentName" ASC
    `);

    console.log('Debug - Query results:', {
      rowCount: result.rowCount,
      firstRow: result.rows[0] ? {
        _id: result.rows[0]._id,
        studentName: result.rows[0].studentName,
        program: result.rows[0].program,
        yearLevel: result.rows[0].yearLevel,
        enrollmentStatus: result.rows[0].enrollmentStatus
      } : null
    });

    // Send the results directly without transformation
    res.status(200).json(result.rows);
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
