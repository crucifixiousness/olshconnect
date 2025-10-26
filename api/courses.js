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
      client = await pool.connect();
      
      // Get courses with their assigned year levels from program_course table
      const result = await client.query(`
        SELECT DISTINCT c.course_id, c.course_code, c.course_name, c.units, c.prerequisite_id,
               py.year_level
        FROM course c
        LEFT JOIN program_course pc ON c.course_id = pc.course_id
        LEFT JOIN program_year py ON pc.year_id = py.year_id
        ORDER BY c.course_code
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Database error", details: error.message });
    } finally {
      if (client) {
        client.release();
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
