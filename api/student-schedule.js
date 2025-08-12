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
    
    console.log('🔍 DEBUG: Student ID from token:', studentId);

    client = await pool.connect();
    console.log('🔍 DEBUG: Database connection established');

    // Get the student's latest enrollment details
    const enrollmentQuery = `
      SELECT e.program_id, e.year_id, e.semester, py.year_level
      FROM enrollments e
      JOIN program_year py ON e.year_id = py.year_id
      WHERE e.student_id = $1
      ORDER BY e.enrollment_date DESC
      LIMIT 1
    `;

    console.log('🔍 DEBUG: Enrollment query:', enrollmentQuery);
    console.log('🔍 DEBUG: Query parameters:', [studentId]);

    const enrollmentResult = await client.query(enrollmentQuery, [studentId]);
    console.log('🔍 DEBUG: Enrollment query result rows:', enrollmentResult.rows.length);
    console.log('🔍 DEBUG: Enrollment query result:', JSON.stringify(enrollmentResult.rows, null, 2));

    if (enrollmentResult.rows.length === 0) {
      console.log('❌ DEBUG: No enrollment found for student');
      return res.status(404).json({ error: 'No enrollment found for this student' });
    }

    const { program_id, year_id, semester } = enrollmentResult.rows[0];
    console.log('🔍 DEBUG: Extracted enrollment data:', {
      program_id,
      year_id,
      semester
    });

    // Normalize semester from JSON format to plain text
    let normalizedSemester = semester;
    if (typeof semester === 'string' && semester.startsWith('{') && semester.endsWith('}')) {
      try {
        const parsed = JSON.parse(semester);
        normalizedSemester = Array.isArray(parsed) ? parsed[0] : parsed;
        console.log('🔍 DEBUG: Normalized semester from JSON:', { original: semester, normalized: normalizedSemester });
      } catch (parseErr) {
        console.log('🔍 DEBUG: Failed to parse semester JSON:', parseErr.message);
      }
    }

    // Fetch schedule data for the student's courses
    const scheduleQuery = `
      SELECT 
        c.course_code,
        c.course_name,
        c.units,
        pc.semester,
        py.year_level,
        ca.section,
        ca.day,
        ca.start_time,
        ca.end_time,
        s.first_name,
        s.last_name
      FROM program_course pc
      JOIN course c ON pc.course_id = c.course_id
      JOIN program_year py ON pc.year_id = py.year_id
      LEFT JOIN course_assignments ca ON pc.pc_id = ca.course_id
      LEFT JOIN staff s ON ca.staff_id = s.staff_id
      WHERE pc.program_id = $1
        AND pc.year_id = $2
        AND pc.semester = $3
      ORDER BY 
        CASE ca.day 
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          ELSE 7
        END,
        ca.start_time,
        c.course_name
    `;

    console.log('🔍 DEBUG: Schedule query:', scheduleQuery);
    console.log('🔍 DEBUG: Schedule query parameters:', [program_id, year_id, normalizedSemester]);

    const scheduleResult = await client.query(scheduleQuery, [program_id, year_id, normalizedSemester]);
    console.log('🔍 DEBUG: Schedule query result rows:', scheduleResult.rows.length);
    console.log('🔍 DEBUG: Schedule query result:', JSON.stringify(scheduleResult.rows, null, 2));

    const response = {
      program_id,
      year_id,
      semester: normalizedSemester,
      schedule: scheduleResult.rows,
      total_courses: scheduleResult.rows.length
    };

    console.log('🔍 DEBUG: Final response:', JSON.stringify(response, null, 2));
    return res.status(200).json(response);
  } catch (error) {
    const status = error.status || 500;
    console.error('❌ ERROR: Error fetching student schedule:', error);
    console.error('❌ ERROR: Error stack:', error.stack);
    return res.status(status).json({ error: error.message || 'Server error' });
  } finally {
    if (client) client.release();
    console.log('🔍 DEBUG: Database connection released');
  }
}; 
