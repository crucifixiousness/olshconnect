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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = authenticateToken(req);
    const { doc_type } = req.body;
    const id = decoded.id;

    if (!id || !doc_type) {
      return res.status(400).json({ message: "Document type is required." });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query(
      "INSERT INTO documentrequest (id, doc_type, req_date, req_status) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, doc_type, currentDate, "Pending"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting request:", error);
    
    if (error.code === "23505") { // PostgreSQL duplicate entry error code
      return res.status(400).json({ message: "Duplicate entry." });
    }
    
    res.status(500).json({ message: "Server error while adding request." });
  }
};
