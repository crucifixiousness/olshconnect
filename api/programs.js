const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(
        "SELECT program_id, program_name FROM program ORDER BY program_name"
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};