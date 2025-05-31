const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { program_id, yearLevel, block } = req.query;

  try {
    let query = `
      SELECT 
        s.id,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as student_name,
        py.year_level,
        sb.block_name as block,
        s.sex
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      JOIN program_year py ON e.year_id = py.year_id
      JOIN student_blocks sb ON e.block_id = sb.block_id
      JOIN program p ON e.program_id = p.program_id
      WHERE e.program_id = $1 
      AND e.enrollment_status = 'Officially Enrolled'
    `;

    const params = [program_id];
    let paramCount = 1;

    if (year_level) {
      paramCount++;
      query += ` AND py.year_level = $${paramCount}`;
      params.push(year_level);
    }

    if (block_name) {
      paramCount++;
      query += ` AND sb.block_name = $${paramCount}`;
      params.push(block_name);
    }

    // Add academic year filter for current year if needed
    query += ` AND e.academic_year = '2023-2024'`; // Adjust the academic year as needed

    // Handle sorting
    query += ` ORDER BY student_name ASC`;

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching program students:', error);
    res.status(500).json({ 
      error: 'Failed to fetch program students',
      details: error.message 
    });
  }
};
