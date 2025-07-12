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
      const { program_id } = req.query;
      
      if (!program_id) {
        return res.status(400).json({ 
          error: "Program ID is required" 
        });
      }

      client = await pool.connect();
      
      // Get all unique blocks for the specified program from student_blocks table
      const result = await client.query(
        `SELECT DISTINCT block_name 
         FROM student_blocks 
         WHERE program_id = $1 
         AND block_name IS NOT NULL 
         AND block_name != 'N/A' 
         AND block_name != ''
         ORDER BY block_name`,
        [program_id]
      );

      const blocks = result.rows.map(row => row.block);

      res.json(blocks);
    } catch (error) {
      console.error("Error fetching program blocks:", error);
      res.status(500).json({ 
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
      message: 'Method not allowed' 
    });
  }
}; 
