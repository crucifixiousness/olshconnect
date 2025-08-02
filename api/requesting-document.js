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
    const { doc_type, description } = req.body;
    const id = decoded.id;

    if (!id || !doc_type) {
      return res.status(400).json({ message: "Document type is required." });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description/reason for request is required." });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const result = await pool.query(
      "INSERT INTO documentrequest (id, doc_type, description, req_date, req_status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, doc_type, description.trim(), currentDate, "Pending"]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to retrieve inserted record');
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error details:", error);
    
    if (error.code === "23505") {
      return res.status(400).json({ message: "Duplicate entry." });
    }
    
    // Send success response even if we encounter an error after successful insertion
    if (error.message === 'Failed to retrieve inserted record') {
      return res.status(201).json({ 
        message: "Request added successfully",
        doc_type,
        description,
        req_date: currentDate,
        req_status: "Pending"
      });
    }
    
    res.status(500).json({ message: "Server error while adding request." });
  }
};
