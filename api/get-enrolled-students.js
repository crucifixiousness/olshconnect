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
    console.log('Query params received:', { program_id, year_level, semester }); // Debug log

    let query = `
      SELECT 
        s.id as student_id,
        s.first_name,
        s.last_name,
        p.program_name,
        py.year_level,
        e.semester,
        e.total_fee,
        COALESCE(e.remaining_balance, 0) as balance,
        (
          SELECT payment_date 
          FROM payment_transactions pt
          WHERE pt.enrollment_id = e.enrollment_id 
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

    if (program_id && program_id !== 'null' && program_id !== 'undefined') {
      query += ` AND p.program_id = $${paramCount}`;
      params.push(program_id);
      paramCount++;
    }

    if (year_level && year_level !== 'null' && year_level !== 'undefined') {
      query += ` AND py.year_level = $${paramCount}`;
      params.push(parseInt(year_level));
      paramCount++;
    }

    if (semester && semester !== 'null' && semester !== 'undefined') {
      query += ` AND e.semester = $${paramCount}`;
      params.push(semester);
    }

    query += ` ORDER BY s.last_name, s.first_name`;

    console.log('Final query:', query); // Debug log
    console.log('Query params:', params); // Debug log

    const result = await pool.query(query, params);
    console.log('Query result count:', result.rows.length); // Debug log

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      query: error.query,
      parameters: error.parameters
    });
    res.status(500).json({ 
      error: 'Failed to fetch student balances',
      details: error.message 
    });
  }
};
