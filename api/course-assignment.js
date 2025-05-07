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
      const query = `
        SELECT 
          pc.pc_id,
          pc.program_id,
          py.year_level,
          pc.semester,
          c.course_code,
          c.course_name,
          c.units,
          ca.section,
          ca.day,
          ca.start_time::varchar,
          ca.end_time::varchar,
          a.staff_id,
          a.full_name as instructor_name
        FROM program_course pc
        JOIN course c ON pc.course_id = c.course_id
        JOIN program_year py ON pc.year_id = py.year_id
        LEFT JOIN course_assignments ca ON pc.pc_id = ca.pc_id
        LEFT JOIN admins a ON ca.staff_id = a.staff_id
        WHERE pc.pc_id = $1`;
      
      const result = await client.query(query, [pc_id]);
      
      if (result.rows.length > 0) {
        const data = result.rows[0];
        res.json({
          ...data,
          instructor_name: data.instructor_name || 'Not assigned',
          section: data.section || 'Not assigned',
          day: data.day || 'Not assigned',
          start_time: data.start_time || 'Not assigned',
          end_time: data.end_time || 'Not assigned'
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
