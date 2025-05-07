const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    let client;
    try {
      const pc_id = req.query.pc_id || req.params.pc_id;
      
      client = await pool.connect();
      
      // Query for course information
      const courseQuery = `
        SELECT 
          pc.pc_id,
          pc.program_id,
          py.year_level,
          pc.semester,
          c.course_code,
          c.course_name,
          c.units
        FROM program_course pc
        JOIN course c ON pc.course_id = c.course_id
        JOIN program_year py ON pc.year_id = py.year_id
        WHERE pc.pc_id = $1`;
      
      // Query for assignment details
      const assignmentQuery = `
        SELECT 
          ca.section,
          a.staff_id,
          a.full_name as instructor_name
        FROM course_assignments ca
        LEFT JOIN admins a ON ca.staff_id = a.staff_id
        WHERE ca.pc_id = $1`;

      const courseResult = await client.query(courseQuery, [pc_id]);
      const assignmentResult = await client.query(assignmentQuery, [pc_id]);
      
      if (courseResult.rows.length > 0) {
        const courseData = courseResult.rows[0];
        const assignmentData = assignmentResult.rows[0] || {};
        
        res.json({
          // Course information
          ...courseData,
          // Assignment details
          instructor_name: assignmentData.instructor_name || 'Not assigned',
          section: assignmentData.section || 'Not assigned',
          staff_id: assignmentData.staff_id || null,
          // Status indicators
          status: {
            course_info: 'fetched',
            assignment_info: assignmentResult.rows.length > 0 ? 'assigned' : 'not assigned'
          }
        });
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
};
