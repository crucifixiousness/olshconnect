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

      // Check if user has appropriate role
      if (!['registrar', 'dean', 'admin', 'super_admin'].includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
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

      // Validate action based on current status and user role
      let newStatus;
      let updateFields = {};
      let performedByField = '';

      switch (action) {
        case 'registrar_approve':
          if (decoded.role !== 'registrar' && !['admin', 'super_admin'].includes(decoded.role)) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Only registrar can approve at registrar level' });
          }
          if (currentStatus !== 'pending') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Grade is not in pending status' });
          }
          newStatus = 'registrar_approved';
          updateFields = {
            registrar_approved_by: decoded.staff_id || decoded.user_id,
            registrar_approved_at: 'CURRENT_TIMESTAMP'
          };
          performedByField = 'registrar_approved_by';
          break;

        case 'dean_approve':
          if (decoded.role !== 'dean' && !['admin', 'super_admin'].includes(decoded.role)) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Only dean can approve at dean level' });
          }
          if (currentStatus !== 'registrar_approved') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Grade must be approved by registrar first' });
          }
          newStatus = 'dean_approved';
          updateFields = {
            dean_approved_by: decoded.staff_id || decoded.user_id,
            dean_approved_at: 'CURRENT_TIMESTAMP'
          };
          performedByField = 'dean_approved_by';
          break;

        case 'final_approve':
          if (!['admin', 'super_admin'].includes(decoded.role)) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Only admin can give final approval' });
          }
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
      const updateQuery = `
        UPDATE grades 
        SET 
          approval_status = $1,
          ${Object.keys(updateFields).map((field, index) => 
            `${field} = ${updateFields[field] === 'CURRENT_TIMESTAMP' ? 'CURRENT_TIMESTAMP' : `$${index + 2}`}`
          ).join(', ')},
          updated_at = CURRENT_TIMESTAMP
        WHERE grade_id = $${Object.keys(updateFields).length + 2}
      `;

      const updateValues = [
        newStatus,
        ...Object.values(updateFields).filter(val => val !== 'CURRENT_TIMESTAMP'),
        gradeId
      ];

      await client.query(updateQuery, updateValues);

      // Log the approval action
      const logQuery = `
        INSERT INTO grade_approval_log (
          grade_id, action, performed_by, comments, previous_status, new_status
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await client.query(logQuery, [
        gradeId,
        action,
        decoded.staff_id || decoded.user_id,
        comments || null,
        currentStatus,
        newStatus
      ]);

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
