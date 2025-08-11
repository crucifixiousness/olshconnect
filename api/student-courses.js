const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    const decoded = authenticateToken(req);
    const studentId = decoded.id;

    client = await pool.connect();

    // Detect if enrollments.major_id column exists
    const majorColumnCheck = await client.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_name = 'enrollments' AND column_name = 'major_id'
       LIMIT 1`
    );

    const hasMajorIdColumn = majorColumnCheck.rows.length > 0;

    // Get the student's latest enrollment details
    const enrollmentQuery = hasMajorIdColumn
      ? `SELECT e.program_id, e.year_id, e.semester, e.major_id, py.year_level
         FROM enrollments e
         JOIN program_year py ON e.year_id = py.year_id
         WHERE e.student_id = $1
         ORDER BY e.enrollment_date DESC
         LIMIT 1`
      : `SELECT e.program_id, e.year_id, e.semester, NULL AS major_id, py.year_level
         FROM enrollments e
         JOIN program_year py ON e.year_id = py.year_id
         WHERE e.student_id = $1
         ORDER BY e.enrollment_date DESC
         LIMIT 1`;

    const enrollmentResult = await client.query(enrollmentQuery, [studentId]);

    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'No enrollment found for this student' });
    }

    const { program_id, year_id, semester, major_id } = enrollmentResult.rows[0];

    // Fetch the courses for the student's program/year/semester and (optional) major
    // Two sets: common courses (pc.major_id IS NULL) and major-specific courses (pc.major_id = student's major)
    const coursesResult = await client.query(
      `SELECT c.course_code, c.course_name, c.units, pc.semester, py.year_level,
              pc.major_id, m.major_name
       FROM program_course pc
       JOIN course c ON pc.course_id = c.course_id
       JOIN program_year py ON pc.year_id = py.year_id
       LEFT JOIN majors m ON pc.major_id = m.major_id
       WHERE pc.program_id = $1
         AND pc.year_id = $2
         AND pc.semester = $3
         AND (
           pc.major_id IS NULL
           OR ($4::int IS NOT NULL AND pc.major_id = $4::int)
         )
       ORDER BY c.course_name`,
      [program_id, year_id, semester, major_id || null]
    );

    return res.status(200).json({
      program_id,
      year_id,
      semester,
      major_id,
      courses: coursesResult.rows,
    });
  } catch (error) {
    const status = error.status || 500;
    console.error('Error fetching student courses:', error);
    return res.status(status).json({ error: error.message || 'Server error' });
  } finally {
    if (client) client.release();
  }
};

