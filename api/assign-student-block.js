const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method === 'PUT') {
    let client;
    try {
      const { student_id, block, program_id } = req.body;
      
      if (!student_id || !block || !program_id) {
        return res.status(400).json({ 
          success: false,
          error: "Student ID, block, and program ID are required" 
        });
      }

      client = await pool.connect();
      
      // First, get student's enrollment details
      const enrollmentResult = await client.query(
        `SELECT year_level, academic_year, semester 
         FROM enrollments 
         WHERE student_id = $1 
         ORDER BY enrollment_date DESC 
         LIMIT 1`,
        [student_id]
      );

      console.log('Enrollment result:', enrollmentResult.rows);

      if (enrollmentResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: "Student enrollment not found" 
        });
      }

      const enrollment = enrollmentResult.rows[0];
      console.log('Enrollment details:', enrollment);
      
      // Check if the block exists in student_blocks table
      let blockResult = await client.query(
        `SELECT block_id FROM student_blocks 
         WHERE program_id = $1 AND block_name = $2`,
        [program_id, block]
      );
      
      console.log('Block check result:', blockResult.rows);
      
      let blockId;
      
      if (blockResult.rows.length === 0) {
        // Block doesn't exist, create it
        console.log('Creating new block with values:', [program_id, enrollment.year_level, block, enrollment.academic_year, enrollment.semester]);
        
        const insertBlockResult = await client.query(
          `INSERT INTO student_blocks (program_id, year_level, block_name, academic_year, semester) 
           VALUES ($1, $2, $3, $4, $5)
           RETURNING block_id`,
          [program_id, enrollment.year_level, block, enrollment.academic_year, enrollment.semester]
        );
        blockId = insertBlockResult.rows[0].block_id;
        console.log('New block created with ID:', blockId);
      } else {
        blockId = blockResult.rows[0].block_id;
        console.log('Using existing block ID:', blockId);
      }
      
      // Update the student's enrollment with the block_id
      const result = await client.query(
        `UPDATE enrollments 
         SET block_id = $1 
         WHERE student_id = $2`,
        [blockId, student_id]
      );

      console.log('Update result:', result);

      if (result.rowCount === 0) {
        return res.status(404).json({ 
          success: false,
          error: "Student not found or not in the specified program" 
        });
      }

      res.json({ 
        success: true, 
        message: `Student assigned to Block ${block} successfully` 
      });
    } catch (error) {
      console.error("Error in main approach:", error);
      
      // Fallback: Try to update the student's block directly
      try {
        console.log("Trying fallback approach...");
        const fallbackResult = await client.query(
          `UPDATE students 
           SET block = $1 
           WHERE id = $2`,
          [req.body.block, req.body.student_id]
        );
        
        console.log('Fallback result:', fallbackResult);
        
        if (fallbackResult.rowCount > 0) {
          res.json({ 
            success: true, 
            message: `Student assigned to Block ${req.body.block} successfully (fallback method)` 
          });
        } else {
          res.status(404).json({ 
            success: false,
            error: "Student not found" 
          });
        }
      } catch (fallbackError) {
        console.error("Fallback approach also failed:", fallbackError);
        res.status(500).json({ 
          success: false,
          error: "Database error", 
          details: error.message 
        });
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  } else {
    res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }
}; 
