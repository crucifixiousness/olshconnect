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
      
      // First, check if the block exists in student_blocks table
      let blockResult = await client.query(
        `SELECT block_id FROM student_blocks 
         WHERE program_id = $1 AND block_name = $2`,
        [program_id, block]
      );
      
      let blockId;
      
      if (blockResult.rows.length === 0) {
        // Block doesn't exist, create it
        const insertBlockResult = await client.query(
          `INSERT INTO student_blocks (program_id, year_level, block_name, academic_year, semester) 
           VALUES ($1, (SELECT year_level FROM enrollments WHERE student_id = $2 LIMIT 1), $3, 
                   (SELECT academic_year FROM enrollments WHERE student_id = $2 LIMIT 1), 
                   (SELECT semester FROM enrollments WHERE student_id = $2 LIMIT 1))
           RETURNING block_id`,
          [program_id, student_id, block]
        );
        blockId = insertBlockResult.rows[0].block_id;
      } else {
        blockId = blockResult.rows[0].block_id;
      }
      
      // Update the student's enrollment with the block_id
      const result = await client.query(
        `UPDATE enrollments 
         SET block_id = $1 
         WHERE student_id = $2`,
        [blockId, student_id]
      );

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
      console.error("Error assigning student to block:", error);
      res.status(500).json({ 
        success: false,
        error: "Database error", 
        details: error.message 
      });
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
