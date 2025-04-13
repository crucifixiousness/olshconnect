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
      const { staff_id } = req.query;
      
      client = await pool.connect();
      const result = await client.query(
        `SELECT 
          ca.pc_id,
          ca.section,
          ca.day,
          ca.start_time,
          ca.end_time,
          c.course_code,
          c.course_name,
          c.units,
          pc.semester,
          p.program_name,
          py.year_level
         FROM course_assignments ca
         JOIN program_course pc ON ca.pc_id = pc.pc_id
         JOIN course c ON pc.course_id = c.course_id
         JOIN program p ON pc.program_id = p.program_id
         JOIN program_year py ON pc.year_id = py.year_id
         WHERE ca.staff_id = $1
         ORDER BY ca.day ASC, ca.start_time ASC`,
        [staff_id]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
      res.status(500).json({ 
        error: "Failed to fetch instructor courses",
        details: error.message 
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};