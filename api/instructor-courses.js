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
      
      client = await pool.connect();
      const result = await client.query(
        `SELECT 
          s.staff_id,
          s.full_name,
          s.role
         FROM staff s
         WHERE s.role = 'instructor' 
         AND s.program_id = $1
         ORDER BY s.full_name ASC`,
        [program_id]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      res.status(500).json({ 
        error: "Failed to fetch instructors",
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
