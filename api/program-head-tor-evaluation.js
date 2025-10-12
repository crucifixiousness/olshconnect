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

// GET - List pending TOR evaluations for program head
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    let client;
    try {
      const decoded = authenticateToken(req);
      const { program_id } = req.query;

      if (!program_id) {
        return res.status(400).json({ error: 'Program ID is required' });
      }

      client = await pool.connect();

      const query = `
        SELECT 
          ter.id,
          ter.student_id,
          ter.program_id,
          ter.status,
          ter.program_head_reviewed_at,
          s.first_name,
          s.last_name,
          p.program_name,
          py.year_level,
          ter.semester
        FROM tor_evaluation_requests ter
        JOIN students s ON ter.student_id = s.id
        JOIN program p ON ter.program_id = p.program_id
        JOIN program_year py ON ter.year_id = py.year_id
        WHERE ter.program_id = $1 
          AND ter.status IN ('pending', 'ph_reviewed')
        ORDER BY ter.id DESC
      `;

      const result = await client.query(query, [program_id]);
      return res.status(200).json({ success: true, requests: result.rows });

    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ error: error.message || 'Server error' });
    } finally {
      if (client) client.release();
    }
  }

  // POST - Program head submits course equivalencies
  else if (req.method === 'POST') {
    let client;
    const debugInfo = [];
    try {
      const decoded = authenticateToken(req);
      const { tor_request_id, equivalencies, comments } = req.body;

      if (!tor_request_id || !equivalencies || !Array.isArray(equivalencies)) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      // DEBUG: Log request data
      debugInfo.push('🔍 DEBUG: Request received');
      debugInfo.push(`🔍 DEBUG: tor_request_id: ${tor_request_id}`);
      debugInfo.push(`🔍 DEBUG: equivalencies count: ${equivalencies.length}`);
      debugInfo.push(`🔍 DEBUG: equivalencies: ${JSON.stringify(equivalencies, null, 2)}`);

      client = await pool.connect();

      await client.query('BEGIN');

      // Update TOR request status
      debugInfo.push(`🔍 DEBUG: Updating TOR request ${tor_request_id} with program_head_id: ${decoded.staff_id}`);
      
      const updateRequestQuery = `
        UPDATE tor_evaluation_requests 
        SET status = 'ph_reviewed',
            program_head_id = $1,
            program_head_reviewed_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      try {
        await client.query(updateRequestQuery, [decoded.staff_id, tor_request_id]);
        debugInfo.push('✅ TOR request status updated successfully');
      } catch (updateError) {
        debugInfo.push(`❌ TOR UPDATE ERROR: ${updateError.message}`);
        debugInfo.push(`❌ TOR UPDATE DETAILS: ${JSON.stringify(updateError, null, 2)}`);
        await client.query('ROLLBACK');
        return res.status(500).json({ 
          error: 'TOR request update failed', 
          details: updateError.message,
          debugInfo: debugInfo 
        });
      }

      // Insert course equivalencies
      for (let i = 0; i < equivalencies.length; i++) {
        const equiv = equivalencies[i];
        debugInfo.push(`🔍 DEBUG: Processing equivalency ${i + 1}:`);
        debugInfo.push(`  - external_course_code: "${equiv.external_course_code}" (${equiv.external_course_code?.length || 0} chars)`);
        debugInfo.push(`  - external_course_name: "${equiv.external_course_name}" (${equiv.external_course_name?.length || 0} chars)`);
        debugInfo.push(`  - equivalent_course_code: "${equiv.equivalent_course_code}" (${equiv.equivalent_course_code?.length || 0} chars)`);
        debugInfo.push(`  - equivalent_course_name: "${equiv.equivalent_course_name}" (${equiv.equivalent_course_name?.length || 0} chars)`);
        debugInfo.push(`  - source_school: "${equiv.source_school}" (${equiv.source_school?.length || 0} chars)`);
        debugInfo.push(`  - source_academic_year: "${equiv.source_academic_year}" (${equiv.source_academic_year?.length || 0} chars)`);
        
        // Check for fields that exceed VARCHAR limits
        const fieldLimits = {
          external_course_code: 50,
          external_course_name: 200,
          equivalent_course_code: 50,
          equivalent_course_name: 200,
          source_school: 200,
          source_academic_year: 20
        };
        
        let hasFieldTooLong = false;
        for (const [field, limit] of Object.entries(fieldLimits)) {
          if (equiv[field] && equiv[field].length > limit) {
            debugInfo.push(`❌ FIELD TOO LONG: ${field} = "${equiv[field]}" (${equiv[field].length} chars) exceeds limit of ${limit}`);
            hasFieldTooLong = true;
          }
        }
        
        if (hasFieldTooLong) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            error: 'Field length exceeds database limit', 
            debugInfo: debugInfo 
          });
        }
        
        const insertEquivQuery = `
          INSERT INTO course_equivalencies (
            tor_request_id, external_course_code, external_course_name,
            external_grade, external_units, equivalent_course_id,
            equivalent_course_code, equivalent_course_name,
            source_school, source_academic_year
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        
        try {
          await client.query(insertEquivQuery, [
            tor_request_id,
            equiv.external_course_code,
            equiv.external_course_name,
            equiv.external_grade,
            equiv.external_units,
            equiv.equivalent_course_id,
            equiv.equivalent_course_code,
            equiv.equivalent_course_name,
            equiv.source_school,
            equiv.source_academic_year
          ]);
          debugInfo.push(`✅ Successfully inserted equivalency ${i + 1}`);
        } catch (insertError) {
          debugInfo.push(`❌ INSERT ERROR for equivalency ${i + 1}: ${insertError.message}`);
          debugInfo.push(`❌ INSERT ERROR DETAILS: ${JSON.stringify(insertError, null, 2)}`);
          await client.query('ROLLBACK');
          return res.status(500).json({ 
            error: 'Database insert failed', 
            details: insertError.message,
            debugInfo: debugInfo 
          });
        }
      }

      await client.query('COMMIT');
      debugInfo.push('✅ All equivalencies processed successfully');
      return res.status(200).json({ 
        success: true, 
        message: 'Course equivalencies submitted successfully',
        debugInfo: debugInfo 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      debugInfo.push(`❌ GENERAL ERROR: ${error.message}`);
      debugInfo.push(`❌ ERROR STACK: ${error.stack}`);
      const status = error.status || 500;
      return res.status(status).json({ 
        error: error.message || 'Server error',
        debugInfo: debugInfo 
      });
    } finally {
      if (client) client.release();
    }
  }

  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};
