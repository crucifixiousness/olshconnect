const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = authenticateToken(req);
    const studentId = decoded.id;
    
    console.log('Student ID from token:', studentId);

    const result = await pool.query(`
      SELECT 
        e.enrollment_id,
        e.semester,
        e.total_fee,
        e.payment_status,
        e.next_payment_date,
        e.remaining_balance,
        p.program_name,
        tf.tuition_amount,
        tf.misc_fees,
        tf.lab_fees,
        tf.other_fees
      FROM enrollments e
      JOIN program p ON e.program_id = p.program_id
      JOIN tuition_fees tf ON e.program_id = tf.program_id 
        AND e.year_id = tf.year_level
        AND e.semester::varchar = tf.semester::varchar
        AND e.academic_year::varchar = tf.academic_year::varchar
      WHERE e.student_id = $1 
        AND e.enrollment_status = 'Verified'
      ORDER BY e.enrollment_date DESC
      LIMIT 1
    `, [studentId]);

    console.log('Query result:', result.rows[0]);

    if (result.rows.length === 0) {
      return res.json([]);
    }

    const paymentData = [{
      id: result.rows[0].enrollment_id,
      semester: result.rows[0].semester,
      program_name: result.rows[0].program_name,
      dueDate: result.rows[0].next_payment_date || 'End of Semester',
      amount: parseFloat(result.rows[0].total_fee || 0),
      status: result.rows[0].payment_status || 'Unpaid',
      breakdown: {
        total: parseFloat(result.rows[0].total_fee || 0),
        tuition: parseFloat(result.rows[0].tuition_amount || 0),
        misc: parseFloat(result.rows[0].misc_fees || 0),
        lab: parseFloat(result.rows[0].lab_fees || 0),
        other: parseFloat(result.rows[0].other_fees || 0)
      }
    }];

    console.log('Final payment data:', paymentData);
    res.json(paymentData);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};
