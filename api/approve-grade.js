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
  if (req.method === 'POST') {
    let client;
    try {
      const decoded = authenticateToken(req, res);
      const { gradeId, action, comments } = req.body;

      if (!gradeId || !action) {
        return res.status(400).json({ error: 'Grade ID and action are required' });
      }

      client = await pool.connect();

      // Start transaction
      await client.query('BEGIN');

      // Get current grade status
      const gradeQuery = `
        SELECT approval_status, student_id, pc_id, final_grade
        FROM grades 
        WHERE grade_id = $1
      `;
      const gradeResult = await client.query(gradeQuery, [gradeId]);
      
      if (gradeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Grade not found' });
      }

      const currentGrade = gradeResult.rows[0];
      const currentStatus = currentGrade.approval_status;

      // Validate action based on current status
      let newStatus;
      let updateFields = {};

      switch (action) {
        case 'registrar_approve':
          if (currentStatus !== 'pending') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Grade is not in pending status' });
          }
          newStatus = 'registrar_approved';
          updateFields = {
            registrar_approved_by: decoded.staff_id || decoded.user_id,
            registrar_approved_at: 'CURRENT_TIMESTAMP'
          };
          break;

        case 'dean_approve':
          if (currentStatus !== 'registrar_approved') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Grade must be approved by registrar first' });
          }
          newStatus = 'dean_approved';
          updateFields = {
            dean_approved_by: decoded.staff_id || decoded.user_id,
            dean_approved_at: 'CURRENT_TIMESTAMP'
          };
          break;

        case 'final_approve':
          if (currentStatus !== 'dean_approved') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Grade must be approved by dean first' });
          }
          newStatus = 'final';
          updateFields = {
            final_approved_at: 'CURRENT_TIMESTAMP'
          };
          break;

        case 'reject':
          newStatus = 'pending';
          // Reset approval fields
          updateFields = {
            registrar_approved_by: null,
            registrar_approved_at: null,
            dean_approved_by: null,
            dean_approved_at: null,
            final_approved_at: null
          };
          break;

        default:
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Invalid action' });
      }

      // Update grade status
      const setClauses = ['approval_status = $1'];
      const updateValues = [
        newStatus
      ];
      let paramIndex = 2;

      for (const [field, value] of Object.entries(updateFields)) {
        if (value === 'CURRENT_TIMESTAMP') {
          setClauses.push(`${field} = CURRENT_TIMESTAMP`);
        } else {
          setClauses.push(`${field} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      }

      setClauses.push('updated_at = CURRENT_TIMESTAMP');

      const updateQuery = `
        UPDATE grades
        SET ${setClauses.join(', ')}
        WHERE grade_id = $${paramIndex}
      `;

      updateValues.push(gradeId);

      await client.query(updateQuery, updateValues);

      // Commit transaction
      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Grade ${action.replace('_', ' ')} successful`,
        gradeId: gradeId,
        previousStatus: currentStatus,
        newStatus: newStatus
      });

    } catch (error) {
      // Rollback transaction on error
      if (client) {
        await client.query('ROLLBACK');
      }

      console.error("Grade approval error:", {
        message: error.message,
        stack: error.stack,
        type: error.name
      });
      
      if (error.message === 'No token provided' || error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Authentication failed' });
      }
      
      res.status(500).json({ 
        error: "Failed to process grade approval",
        details: error.message 
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
