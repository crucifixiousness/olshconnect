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
    const { courseId } = req.query;
    
    console.log('🔍 DEBUG: Course ID from query:', courseId);
    console.log('🔍 DEBUG: Authenticated user:', decoded);

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    client = await pool.connect();
    console.log('🔍 DEBUG: Database connection established');

    // Get course details first
    const courseQuery = `
      SELECT pc.pc_id, pc.program_id, pc.year_id, pc.semester, 
             c.course_code, c.course_name, c.units,
             ca.section, ca.day, ca.start_time, ca.end_time
      FROM program_course pc
      JOIN course c ON pc.course_id = c.course_id
      LEFT JOIN course_assignments ca ON pc.pc_id = ca.pc_id
      WHERE pc.pc_id = $1
    `;

    const courseResult = await client.query(courseQuery, [courseId]);
    console.log('🔍 DEBUG: Course query result:', courseResult.rows);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];
    console.log('🔍 DEBUG: Course details:', course);

    // Get students enrolled in this course based on the instructor's assignment
    const studentsQuery = `
      SELECT DISTINCT
        s.id as student_id,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as name,
        s.email,
        e.enrollment_date,
        e.enrollment_status,
        COALESCE(g.final_grade::text, '') as final_grade
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      JOIN program_year py ON e.year_id = py.year_id
      LEFT JOIN student_blocks sb ON e.block_id = sb.block_id
      LEFT JOIN grades g ON s.id = g.student_id AND g.pc_id = $1
      WHERE e.program_id = $2
        AND e.year_id = $3
        AND e.semester = $4
        AND (sb.block_name = $5 OR e.block_id IS NULL)
        AND e.enrollment_status = 'Officially Enrolled'
      ORDER BY 2
    `;

    const queryParams = [
      courseId,
      course.program_id,
      course.year_id,
      course.semester,
      course.section
    ];

    console.log('🔍 DEBUG: Students query:', studentsQuery);
    console.log('🔍 DEBUG: Query parameters:', queryParams);

    // Let's debug what's in the database
    const debugQuery1 = `
      SELECT COUNT(*) as total_enrollments
      FROM enrollments e
      WHERE e.program_id = $1 AND e.year_id = $2 AND e.semester = $3
    `;
    const debugResult1 = await client.query(debugQuery1, [course.program_id, course.year_id, course.semester]);
    console.log('🔍 DEBUG: Total enrollments for this program/year/semester:', debugResult1.rows[0]);

    const debugQuery2 = `
      SELECT e.block_id, e.enrollment_status, COUNT(*) as count
      FROM enrollments e
      WHERE e.program_id = $1 AND e.year_id = $2 AND e.semester = $3
      GROUP BY e.block_id, e.enrollment_status
    `;
    const debugResult2 = await client.query(debugQuery2, [course.program_id, course.year_id, course.semester]);
    console.log('🔍 DEBUG: Enrollment breakdown by block and status:', debugResult2.rows);

    const debugQuery3 = `
      SELECT * FROM student_blocks 
      WHERE program_id = $1 AND semester = $2
    `;
    const debugResult3 = await client.query(debugQuery3, [course.program_id, course.semester]);
    console.log('🔍 DEBUG: Available student blocks:', debugResult3.rows);

    const studentsResult = await client.query(studentsQuery, queryParams);
    console.log('🔍 DEBUG: Students found:', studentsResult.rows.length);

    const response = {
      course: {
        pc_id: course.pc_id,
        course_code: course.course_code,
        course_name: course.course_name,
        units: course.units,
        semester: course.semester,
        section: course.section,
        day: course.day,
        start_time: course.start_time,
        end_time: course.end_time
      },
      students: studentsResult.rows,
      total_students: studentsResult.rows.length
    };

    console.log('🔍 DEBUG: Final response:', response);
    return res.status(200).json(response.students);

  } catch (error) {
    const status = error.status || 500;
    console.error('❌ ERROR: Error fetching course students:', error);
    console.error('❌ ERROR: Error stack:', error.stack);
    return res.status(status).json({ error: error.message || 'Server error' });
  } finally {
    if (client) client.release();
    console.log('🔍 DEBUG: Database connection released');
  }
}; 
