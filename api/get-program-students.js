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

  const { program_id, yearLevel, block, sortBy } = req.query;

  try {
    let query = `
      SELECT 
        s.id,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as student_name,
        py.year_level,
        s.block,
        s.sex
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      JOIN program_year py ON e.year_id = py.year_id
      WHERE e.program_id = $1 AND e.enrollment_status = 'Officially Enrolled'
    `;

    const params = [program_id];
    let paramCount = 1;

    if (yearLevel) {
      paramCount++;
      query += ` AND py.year_level = $${paramCount}`;
      params.push(yearLevel);
    }

    if (block) {
      paramCount++;
      query += ` AND s.block = $${paramCount}`;
      params.push(block);
    }

    // Handle sorting
    query += ` ORDER BY student_name ${sortBy === 'desc' ? 'DESC' : 'ASC'}`;

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