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
    
    const result = await pool.query(`
      SELECT 
        e.*,
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
        AND py.year_level = tf.year_level 
        AND e.semester = tf.semester
        AND e.academic_year = tf.academic_year
      WHERE e.student_id = $1 AND e.enrollment_status = 'Verified'
      ORDER BY e.enrollment_date DESC
      LIMIT 1
    `, [studentId]);

    if (result.rows.length === 0) {
      return res.json([]);
    }

    const currentEnrollment = result.rows[0];
    const totalAmount = parseFloat(currentEnrollment.total_fee || 0);
    const tuitionAmount = parseFloat(currentEnrollment.tuition_amount || 0);
    const miscAmount = parseFloat(currentEnrollment.misc_fees || 0);
    const labAmount = parseFloat(currentEnrollment.lab_fees || 0);
    const otherAmount = parseFloat(currentEnrollment.other_fees || 0);

    const paymentData = [{
      id: currentEnrollment.enrollment_id,
      description: `Tuition Fee - ${currentEnrollment.program_name} (${currentEnrollment.semester} Semester)`,
      dueDate: currentEnrollment.next_payment_date || 'End of Semester',
      amount: totalAmount,
      status: currentEnrollment.payment_status || 'Unpaid',
      breakdown: {
        total: totalAmount,
        tuition: tuitionAmount,
        misc: miscAmount,
        lab: labAmount,
        other: otherAmount
      }
    }];

    res.json(paymentData);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};
