const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method === 'PUT') {
    const { course_id, instructor_id, section, day, start_time, end_time } = req.body;
    let client;

    try {
      client = await pool.connect();
      
      // First check if the assignment already exists
      const existing = await client.query(
        `SELECT * FROM course_assignments 
         WHERE pc_id = $1`,
        [course_id]
      );

      let query;
      let params;

      if (existing.rows.length > 0) {
        // Update existing assignment
        query = `UPDATE course_assignments 
                 SET staff_id = $1, section = $2, day = $3, 
                     start_time = $4, end_time = $5
                 WHERE pc_id = $6`;
        params = [instructor_id, section, day, start_time, end_time, course_id];
      } else {
        // Create new assignment
        query = `INSERT INTO course_assignments 
                 (pc_id, staff_id, section, day, start_time, end_time)
                 VALUES ($1, $2, $3, $4, $5, $6)`;
        params = [course_id, instructor_id, section, day, start_time, end_time];
      }

      await client.query(query, params);
      res.json({ message: "Instructor assigned successfully" });
    } catch (error) {
      console.error("Error assigning instructor:", error);
      res.status(500).json({ error: "Failed to assign instructor" });
    } finally {
      if (client) client.release();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};