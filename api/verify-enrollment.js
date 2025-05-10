const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const authenticateToken = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('No token provided');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = async (req, res) => {
  if (req.method === 'PUT') {
    try {
      const decoded = authenticateToken(req, res);
      const enrollmentId = req.query.id;
      console.log('Request query:', req.query); // Debug log
      console.log('Enrollment ID received:', enrollmentId); // Debug log
      
      if (!enrollmentId) {
        return res.status(400).json({ error: "Enrollment ID is required" });
      }

      // Get enrollment details first
      const enrollmentResult = await pool.query(
        `SELECT program_id, year_id, semester, academic_year 
         FROM enrollments 
         WHERE enrollment_id = $1`,
        [enrollmentId]
      );

      if (enrollmentResult.rows.length === 0) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      const enrollment = enrollmentResult.rows[0];

      // Get tuition fees
      const feesResult = await pool.query(
        `SELECT tuition_amount, misc_fees, lab_fees, other_fees 
         FROM tuition_fees 
         WHERE program_id = $1 
         AND year_level = $2 
         AND semester = $3 
         AND academic_year = $4`,
        [enrollment.program_id, enrollment.year_id, enrollment.semester, enrollment.academic_year]
      );

      if (feesResult.rows.length === 0) {
        return res.status(404).json({ error: "Tuition fees not configured" });
      }

      // Calculate total fees
      const fees = feesResult.rows[0];
      const totalFee = parseFloat(fees.tuition_amount) +
                      parseFloat(fees.misc_fees) +
                      parseFloat(fees.lab_fees) +
                      parseFloat(fees.other_fees);

      // Update enrollment with fees and status
      const result = await pool.query(
        `UPDATE enrollments 
         SET enrollment_status = 'Verified',
             total_fee = $1,
             remaining_balance = $2,
             payment_status = 'Unpaid'
         WHERE enrollment_id = $3
         RETURNING *`,
        [totalFee, totalFee, enrollmentId]
      );
      
      console.log('Query result:', result); // Debug log

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      res.json({ 
        success: true,
        message: "Enrollment verified successfully" 
      });
    } catch (error) {
      console.error("Error verifying enrollment:", error);
      res.status(500).json({ error: "Failed to verify enrollment" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
