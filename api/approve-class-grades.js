const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function authenticateToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    const err = new Error('No token provided');
    err.status = 401;
    throw err;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error('Invalid token');
    err.status = 401;
    throw err;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    const decoded = authenticateToken(req);
    const { pcId, action } = req.body;

    if (!pcId || !action) {
      return res.status(400).json({ error: 'pcId and action are required' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    let setClause = '';
    if (action === 'registrar_approve') {
      setClause = `approval_status = 'registrar_approved', registrar_approved_by = $1, registrar_approved_at = CURRENT_TIMESTAMP`;
    } else if (action === 'dean_approve') {
      setClause = `approval_status = 'dean_approved', dean_approved_by = $1, dean_approved_at = CURRENT_TIMESTAMP`;
    } else if (action === 'final_approve') {
      setClause = `approval_status = 'final', final_approved_at = CURRENT_TIMESTAMP`;
    } else if (action === 'reject') {
      setClause = `approval_status = 'pending', registrar_approved_by = NULL, registrar_approved_at = NULL, dean_approved_by = NULL, dean_approved_at = NULL, final_approved_at = NULL`;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Build query
    let params = [];
    let paramIndex = 1;
    if (setClause.includes('$1')) {
      params.push(decoded.staff_id || decoded.user_id || null);
      paramIndex++;
    }
    params.push(pcId);

    const bulkQuery = `
      UPDATE grades
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE pc_id = $${paramIndex}
      RETURNING grade_id
    `;

    const result = await client.query(bulkQuery, params);
    await client.query('COMMIT');

    return res.status(200).json({ success: true, updated: result.rowCount });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Server error' });
  } finally {
    if (client) client.release();
  }
};
