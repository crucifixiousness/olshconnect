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

    console.log('Fetching enrollment data for student:', studentId);

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
        tf.other_fees,
        py.year_level
      FROM enrollments e
      JOIN program p ON e.program_id = p.program_id
      JOIN program_year py ON e.year_id = py.year_id
      LEFT JOIN tuition_fees tf ON e.program_id = tf.program_id 
        AND e.year_id = tf.year_level
        AND e.semester = tf.semester
        AND e.academic_year = tf.academic_year
      WHERE e.student_id = $1 
        AND e.enrollment_status = 'Verified'
      ORDER BY e.enrollment_date DESC
      LIMIT 1
    `, [studentId]);

    if (!result.rows.length) {
      return res.json([]);  // Return empty array if no verified enrollment
    }

    const enrollment = result.rows[0];
    
    // Get tuition fees
    const feesQuery = await pool.query(`
      SELECT * FROM tuition_fees 
      WHERE program_id = $1 
      AND year_level = $2 
      AND semester = $3`,
      [
        enrollment.program_id,
        enrollment.year_level,
        enrollment.semester.replace(/[{"}]/g, '')
      ]
    );

    const fees = feesQuery.rows[0] || {};
    
    const paymentData = [{
      id: enrollment.enrollment_id,
      semester: enrollment.semester,
      program_name: enrollment.program_name,
      description: `Tuition Fee - ${enrollment.program_name} (${enrollment.semester.replace(/[{"}]/g, '')} Semester)`,
      dueDate: 'End of Semester',
      amount: parseFloat(enrollment.total_fee || 0),
      status: enrollment.payment_status || 'Unpaid',
      breakdown: {
        total: parseFloat(enrollment.total_fee || 0),
        tuition: parseFloat(fees?.tuition_amount || 0),
        misc: parseFloat(fees?.misc_fees || 0),
        lab: parseFloat(fees?.lab_fees || 0),
        other: parseFloat(fees?.other_fees || 0)
      }
    }];

    console.log('Final payment data:', paymentData[0]);
    res.json(paymentData);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};
