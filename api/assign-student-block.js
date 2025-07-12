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
      
      // Update the student's block in the database
      const result = await client.query(
        `UPDATE students 
         SET block = $1 
         WHERE id = $2 AND program_id = $3`,
        [block, student_id, program_id]
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