const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { program_id, course_code, course_name, units, semester, year_level } = req.body;
    let client;

    try {
      // Input validation
      if (!program_id || !course_code || !course_name || !units || !semester || !year_level) {
        return res.status(400).json({ error: "All fields are required" });
      }

      client = await pool.connect();
      await client.query('BEGIN');

      // 1. Create or get course
      let course_id;
      const existingCourse = await client.query(
        "SELECT course_id FROM course WHERE course_code = $1",
        [course_code]
      );

      if (existingCourse.rows.length === 0) {
        const newCourse = await client.query(
          "INSERT INTO course (course_code, course_name, units) VALUES ($1, $2, $3) RETURNING course_id",
          [course_code, course_name, units]
        );
        course_id = newCourse.rows[0].course_id;
      } else {
        course_id = existingCourse.rows[0].course_id;
      }

      // 2. Create or get program year
      let year_id;
      const existingYear = await client.query(
        "SELECT year_id FROM program_year WHERE program_id = $1 AND year_level = $2",
        [program_id, year_level]
      );

      if (existingYear.rows.length === 0) {
        const paddedYearLevel = String(year_level).padStart(2, '0');
        year_id = parseInt(program_id + paddedYearLevel);
        
        await client.query(
          "INSERT INTO program_year (year_id, program_id, year_level) VALUES ($1, $2, $3)",
          [year_id, program_id, year_level]
        );
      } else {
        year_id = existingYear.rows[0].year_id;
      }

      // 3. Create program course assignmentsdf
      await client.query(
        "INSERT INTO program_course (program_id, year_id, course_id, semester) VALUES ($1, $2, $3, $4)",
        [program_id, year_id, course_id, semester]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: "Course assigned successfully" });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error("Error in program-course:", error);
      res.status(500).json({ 
        error: "Database error", 
        details: error.message,
        sqlMessage: error.sqlMessage 
      });
    } finally {
      if (client) client.release();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
