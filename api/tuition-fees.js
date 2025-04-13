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
      const [rows] = await pool.query(`
        SELECT tf.*, p.program_name 
        FROM tuition_fees tf
        JOIN program p ON tf.program_id = p.program_id
        ORDER BY p.program_name, tf.year_level, tf.semester
      `);
      res.json(rows);
    } catch (error) {
      console.error("Error fetching tuition fees:", error);
      res.status(500).json({ error: "Failed to fetch tuition fees" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};