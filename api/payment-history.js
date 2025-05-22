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

  let client;
  try {
    const decoded = authenticateToken(req);
    client = await pool.connect();

    const result = await client.query(`
      SELECT 
        pt.transaction_id,
        pt.reference_number,
        pt.payment_date,
        pt.amount_paid,
        pt.payment_method,
        pt.payment_status,
        pt.remarks,
        a.first_name || ' ' || a.last_name as processed_by_name
      FROM payment_transactions pt
      LEFT JOIN admins a ON pt.processed_by = a.staff_id
      WHERE pt.student_id = $1
      ORDER BY pt.payment_date DESC
    `, [decoded.id]);

    // Return the query result directly
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  } finally {
    if (client) client.release();
  }
};
