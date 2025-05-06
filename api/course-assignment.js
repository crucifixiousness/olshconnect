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
          pc.year_level,
          pc.semester,
          ca.section,
          ca.day,
          ca.start_time,
          ca.end_time,
          a.staff_id,
          a.full_name as instructor_name
        FROM program_course pc
        LEFT JOIN course_assignments ca ON pc.pc_id = ca.pc_id
        LEFT JOIN admins a ON ca.staff_id = a.staff_id
        WHERE pc.pc_id = $1
      `;
      
      const result = await client.query(query, [pc_id]);
      
      if (result.rows.length > 0) {
        const data = result.rows[0];
        // Format time if exists
        if (data.start_time) {
          data.start_time = data.start_time.slice(0, 5);
        }
        if (data.end_time) {
          data.end_time = data.end_time.slice(0, 5);
        }
        res.json(data);
      } else {
        res.json({
          instructor_name: 'Not assigned',
          section: 'Not assigned',
          day: '',
          start_time: '',
          end_time: ''
        });
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
