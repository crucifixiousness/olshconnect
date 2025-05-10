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
      
      const result = await pool.query(
        `UPDATE enrollments 
         SET enrollment_status = 'Verified'
         WHERE enrollment_id = $1
         RETURNING *`,
        [enrollmentId]
      );

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
