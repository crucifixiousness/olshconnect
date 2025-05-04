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
        `SELECT ca.*, a.staff_id, a.full_name as instructor_name,
                pc.program_id, pc.year_level,
                c.course_code, c.course_name, c.units
         FROM course_assignments ca
         LEFT JOIN admins a ON ca.staff_id = a.staff_id
         LEFT JOIN program_course pc ON ca.pc_id = pc.pc_id
         LEFT JOIN course c ON pc.course_id = c.course_id
         WHERE ca.pc_id = $1`,
        [pc_id]
      );
      
      // Format time values for frontend display
      const assignment = result.rows[0];
      if (assignment) {
        if (assignment.start_time) {
          assignment.start_time = assignment.start_time.slice(0, 5); // Convert "HH:MM:SS" to "HH:MM"
        }
        if (assignment.end_time) {
          assignment.end_time = assignment.end_time.slice(0, 5);
        }
      }

      res.json(assignment || null);
    } catch (error) {
      console.error("Error fetching course assignment:", error);
      res.status(500).json({ error: "Failed to fetch course assignment" });
    } finally {
      if (client) {
        client.release();
      }
    }
  } else if (req.method === 'PUT') {
    let client;
    try {
      const { course_id, instructor_id, section, day, start_time, end_time } = req.body;
      
      client = await pool.connect();

      // Check for schedule conflicts
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
          error: `Schedule conflict: ${conflict.instructor_name} is already assigned to ${conflict.course_name} from ${conflict.start_time.slice(0, 5)} to ${conflict.end_time.slice(0, 5)}`
        });
      }

      // Update or insert assignment
      const result = await client.query(
        `INSERT INTO course_assignments 
         (pc_id, staff_id, section, day, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (pc_id)
         DO UPDATE SET 
           staff_id = EXCLUDED.staff_id,
           section = EXCLUDED.section,
           day = EXCLUDED.day,
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time
         RETURNING *`,
        [course_id, instructor_id, section, day, start_time, end_time]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating course assignment:", error);
      res.status(500).json({ error: "Failed to update course assignment" });
    } finally {
      if (client) {
        client.release();
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
