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
      const { pc_id } = req.query;
      
      client = await pool.connect();
      const result = await client.query(
        `SELECT ca.*, a.staff_id, a.full_name as instructor_name
         FROM course_assignments ca
         LEFT JOIN admins a ON ca.staff_id = a.staff_id
         WHERE ca.pc_id = $1`,
        [pc_id]
      );
      
      res.json(result.rows[0] || null);
    } catch (error) {
      console.error("Error fetching course assignment:", error);
      res.status(500).json({ error: "Failed to fetch course assignment" });
    } finally {
      if (client) {
        client.release();
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};