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
          p.program_name,
          COALESCE(tf.tuition_amount, 0) as tuition_amount,
          COALESCE(tf.misc_fees, 0) as misc_fees,
          COALESCE(tf.lab_fees, 0) as lab_fees,
          COALESCE(tf.other_fees, 0) as other_fees
        FROM enrollments e
        JOIN program p ON e.program_id = p.program_id
        LEFT JOIN tuition_fees tf ON e.program_id = tf.program_id 
          AND e.year_id = tf.year_level
          AND e.semester = tf.semester
          AND e.academic_year = tf.academic_year
        WHERE e.student_id = $1 AND e.enrollment_status = 'Verified'
        ORDER BY e.enrollment_date DESC
        LIMIT 1
      `, [studentId]);

    console.log('Database query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No enrollment found for student:', studentId);
      return res.json([]);
    }

    const currentEnrollment = result.rows[0];
    const semester = JSON.parse(currentEnrollment.semester);

    const paymentData = [{
      id: currentEnrollment.enrollment_id,
      description: `Tuition Fee - ${currentEnrollment.program_name} (${semester} Semester)`,
      dueDate: currentEnrollment.next_payment_date || 'End of Semester',
      amount: parseFloat(currentEnrollment.total_fee || 0),
      status: currentEnrollment.payment_status || 'Unpaid',
      breakdown: {
        total: parseFloat(currentEnrollment.total_fee || 0),
        tuition: parseFloat(currentEnrollment.tuition_amount || 0),
        misc: parseFloat(currentEnrollment.misc_fees || 0),
        lab: parseFloat(currentEnrollment.lab_fees || 0),
        other: parseFloat(currentEnrollment.other_fees || 0)
      }
    }];

    console.log('Final payment data:', paymentData);
    res.json(paymentData);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};
