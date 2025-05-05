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
      
      // First check if this instructor is already assigned to this course
      const currentAssignment = await client.query(
        `SELECT * FROM course_assignments 
         WHERE pc_id = $1`,
        [course_id]
      );

      // Check for schedule conflicts with other courses
      const conflictCheck = await client.query(
        `SELECT ca.*, c.course_name, a.full_name as instructor_name
         FROM course_assignments ca
         JOIN program_course pc ON ca.pc_id = pc.pc_id
         JOIN course c ON pc.course_id = c.course_id
         JOIN admins a ON ca.staff_id = a.staff_id
         WHERE ca.staff_id = $1 
         AND ca.day = $2
         AND ca.pc_id != $3
         AND (
           (ca.start_time <= $4 AND ca.end_time > $4)
           OR (ca.start_time < $5 AND ca.end_time >= $5)
           OR (ca.start_time >= $4 AND ca.end_time <= $5)
         )`,
        [instructor_id, day, course_id, start_time, end_time]
      );

      if (conflictCheck.rows.length > 0) {
        const conflict = conflictCheck.rows[0];
        return res.status(400).json({
          error: `Schedule conflict: ${conflict.instructor_name} is already assigned to ${conflict.course_name} from ${conflict.start_time.slice(0, 5)} to ${conflict.end_time.slice(0, 5)} on ${conflict.day}`
        });
      }

      // If no conflicts, proceed with assignment
      let result;
      if (currentAssignment.rows.length > 0) {
        // Update existing assignment
        result = await client.query(
          `UPDATE course_assignments 
           SET staff_id = $1, section = $2, day = $3, 
               start_time = $4, end_time = $5
           WHERE pc_id = $6
           RETURNING *`,
          [instructor_id, section, day, start_time, end_time, course_id]
        );
      } else {
        // Create new assignment
        result = await client.query(
          `INSERT INTO course_assignments 
           (pc_id, staff_id, section, day, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [course_id, instructor_id, section, day, start_time, end_time]
        );
      }

      res.json(result.rows[0]);
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
