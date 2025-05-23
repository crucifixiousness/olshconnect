const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;
  try {
    const decoded = authenticateToken(req);
    const { id: staff_id } = decoded; // Changed from staff_id to id

    const { enrollment_id, amount_paid, payment_method, reference_number } = req.body;

    if (!enrollment_id || !amount_paid || !payment_method) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // Get enrollment details with student info
    const enrollmentResult = await client.query(
      `SELECT e.*, s.first_name, s.last_name, s.id as student_id
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.enrollment_id = $1 
       AND e.enrollment_status = 'Verified'`,
      [enrollment_id]
    );

    if (enrollmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: "No verified enrollment found"
      });
    }

    const enrollment = enrollmentResult.rows[0];
    
    // Get current date for both payment_date and reference number
    const paymentDate = new Date();
    const dateStr = paymentDate.toISOString().slice(2,10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const generatedRefNumber = `PAY${dateStr}${randomNum}`;

    const currentAmountPaid = parseFloat(enrollment.amount_paid || 0);
    
    const newPaymentAmount = parseFloat(amount_paid);
    const totalAmountPaid = currentAmountPaid + newPaymentAmount;
    const totalFee = parseFloat(enrollment.total_fee);
    const remainingBalance = totalFee - totalAmountPaid;

    let paymentStatus;
    if (totalAmountPaid >= totalFee) {
      paymentStatus = 'Fully Paid';
    } else if (totalAmountPaid > 0) {
      paymentStatus = 'Partial';
    } else {
      paymentStatus = 'Unpaid';
    }

    // Insert payment transaction
    const result = await client.query(`
      INSERT INTO payment_transactions (
        enrollment_id,
        student_id,
        amount_paid,
        payment_date,
        payment_method,
        reference_number,
        remarks,
        payment_status,
        processed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING transaction_id`,
      [
        enrollment_id,
        enrollment.student_id,
        parseFloat(amount_paid),
        paymentDate,  // Use the same date object
        payment_method,
        generatedRefNumber,
        `Counter payment for ${enrollment.first_name} ${enrollment.last_name}`,
        paymentStatus,
        staff_id
      ]
    );

    // Update enrollment payment status
    await client.query(`
      UPDATE enrollments 
      SET payment_status = $1,
          amount_paid = $2,
          remaining_balance = $3,
          next_payment_date = CURRENT_TIMESTAMP + INTERVAL '1 month'
      WHERE enrollment_id = $4`,
      [paymentStatus, totalAmountPaid, remainingBalance, enrollment_id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      transaction_id: result.rows[0].transaction_id,
      payment_status: paymentStatus,
      remaining_balance: remainingBalance
    });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error processing payment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing payment: ' + error.message 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};
