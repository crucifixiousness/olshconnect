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

  try {
    const { program_id, year_level, semester } = req.query;

    let query = `
      SELECT 
        s.id as student_id,
        s.first_name,
        s.last_name,
        p.program_name,
        py.year_level,
        e.semester,
        e.total_fee,
        e.remaining_balance as balance,
        (
          SELECT payment_date 
          FROM payment_transactions 
          WHERE enrollment_id = e.enrollment_id 
          ORDER BY payment_date DESC 
          LIMIT 1
        ) as last_payment_date
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      JOIN program p ON e.program_id = p.program_id
      JOIN program_year py ON e.year_id = py.year_id
      WHERE e.remaining_balance > 0
      AND e.enrollment_status = 'Officially Enrolled'
    `;

    const params = [];
    let paramCount = 1;

    if (program_id) {
      query += ` AND p.program_id = $${paramCount}`;
      params.push(program_id);
      paramCount++;
    }

    if (year_level) {
      query += ` AND py.year_level = $${paramCount}`;
      params.push(year_level);
      paramCount++;
    }

    if (semester) {
      query += ` AND e.semester = $${paramCount}`;
      params.push(semester);
    }

    query += ` ORDER BY s.last_name, s.first_name`;

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching student balances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch student balances',
      details: error.message 
    });
  }
};