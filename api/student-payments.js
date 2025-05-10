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

    // Get enrollment details first
    const enrollmentResult = await pool.query(
      `SELECT e.*, py.year_level, p.program_name
       FROM enrollments e
       JOIN program_year py ON e.year_id = py.year_id
       JOIN program p ON e.program_id = p.program_id
       WHERE e.student_id = $1 AND e.enrollment_status = 'Verified'
       ORDER BY e.enrollment_date DESC
       LIMIT 1`,
      [studentId]
    );

    if (enrollmentResult.rows.length === 0) {
      return res.json([]);
    }

    const enrollment = enrollmentResult.rows[0];

    // Get tuition fees with same query as verify-enrollment
    const feesResult = await pool.query(
      `SELECT tuition_amount, misc_fees, lab_fees, other_fees 
       FROM tuition_fees 
       WHERE program_id = $1 
       AND year_level = $2 
       AND semester = $3::varchar`,
      [
        enrollment.program_id,
        enrollment.year_level,
        enrollment.semester.replace(/[{"}]/g, '')
      ]
    );

    console.log('Fees found:', feesResult.rows[0]);

    const fees = feesResult.rows[0];
    const paymentData = [{
      id: enrollment.enrollment_id,
      semester: enrollment.semester,
      program_name: enrollment.program_name,
      description: `Tuition Fee - ${enrollment.program_name} (${enrollment.semester.replace(/[{"}]/g, '')} Semester)`,
      dueDate: enrollment.next_payment_date || 'End of Semester',
      amount: enrollment.total_fee,
      status: enrollment.payment_status || 'Unpaid',
      breakdown: {
        total: parseFloat(enrollment.total_fee || 0),
        tuition: parseFloat(fees.tuition_amount || 0),
        misc: parseFloat(fees.misc_fees || 0),
        lab: parseFloat(fees.lab_fees || 0),
        other: parseFloat(fees.other_fees || 0)
      }
    }];

    console.log('Final payment data:', paymentData);
    res.json(paymentData);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};
