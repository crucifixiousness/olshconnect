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
      
      if (!program_id || program_id === 'null') {
        return res.status(400).json({ error: "Valid program ID is required" });
      }

      client = await pool.connect();
      const result = await client.query(
        `SELECT pc.pc_id, p.program_name, py.year_level, c.course_code, 
                c.course_name, c.units, pc.semester
         FROM program_course pc
         JOIN program p ON pc.program_id = p.program_id
         JOIN program_year py ON pc.year_id = py.year_id
         JOIN course c ON pc.course_id = c.course_id
         WHERE pc.program_id = $1`,
        [program_id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching program courses:", error);
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