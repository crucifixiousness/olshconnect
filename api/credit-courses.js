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
      const { program_id } = req.query;
      
      if (!program_id) {
        return res.status(400).json({ error: 'Program ID is required' });
      }
      
      client = await pool.connect();
      
      // Get all courses for the specific program for credit transfer evaluation
      const query = `
        SELECT DISTINCT c.course_id, c.course_code, c.course_name, c.units
        FROM course c
        JOIN program_course pc ON c.course_id = pc.course_id
        WHERE pc.program_id = $1
        ORDER BY c.course_code
      `;
      
      const result = await client.query(query, [program_id]);
      res.json({ courses: result.rows });
    } catch (error) {
      console.error("Error fetching credit courses:", error);
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
