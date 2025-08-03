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

  try {
    // Verify token
    authenticateToken(req);

    // Get total enrollments by program
    const programStatsResult = await pool.query(`
      SELECT 
        p.program_name,
        COUNT(e.enrollment_id) as total_enrollments,
        COUNT(CASE WHEN e.enrollment_status = 'Verified' THEN 1 END) as verified_enrollments,
        COUNT(CASE WHEN e.enrollment_status = 'Pending' THEN 1 END) as pending_enrollments,
        COUNT(CASE WHEN e.enrollment_status = 'Rejected' THEN 1 END) as rejected_enrollments
      FROM program p
      LEFT JOIN enrollments e ON p.program_id = e.program_id
      GROUP BY p.program_name, p.program_id
      ORDER BY total_enrollments DESC
    `);

    // Get total students by year level
    const yearLevelStatsResult = await pool.query(`
      SELECT 
        py.year_level,
        COUNT(e.enrollment_id) as total_students
      FROM program_year py
      LEFT JOIN enrollments e ON py.year_id = e.year_id
      WHERE e.enrollment_status IN ('Verified', 'For Payment', 'Officially Enrolled')
      GROUP BY py.year_level, py.year_id
      ORDER BY py.year_id
    `);

    // Get recent enrollments (last 10 enrollments with detailed info)
    const recentEnrollmentsResult = await pool.query(`
      SELECT 
        e.enrollment_id,
        e.enrollment_date,
        e.enrollment_status,
        e.academic_year,
        e.semester,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as student_name,
        s.id as student_id,
        p.program_name,
        py.year_level,
        CASE 
          WHEN e.idpic IS NOT NULL THEN 'Yes'
          ELSE 'No'
        END as has_id_pic,
        CASE 
          WHEN e.birth_certificate_doc IS NOT NULL THEN 'Yes'
          ELSE 'No'
        END as has_birth_cert,
        CASE 
          WHEN e.form137_doc IS NOT NULL THEN 'Yes'
          ELSE 'No'
        END as has_form137
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN program p ON e.program_id = p.program_id
      JOIN program_year py ON e.year_id = py.year_id
      ORDER BY e.enrollment_date DESC
      LIMIT 10
    `);

    // Get enrollment statistics for charts
    const enrollmentStatsResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', enrollment_date) as month,
        COUNT(*) as enrollment_count,
        COUNT(CASE WHEN enrollment_status = 'Verified' THEN 1 END) as verified_count,
        COUNT(CASE WHEN enrollment_status = 'Pending' THEN 1 END) as pending_count
      FROM enrollments
      WHERE enrollment_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', enrollment_date)
      ORDER BY month DESC
    `);

    // Get enrollment status distribution
    const enrollmentStatusStatsResult = await pool.query(`
      SELECT 
        enrollment_status,
        COUNT(*) as count
      FROM enrollments
      GROUP BY enrollment_status
      ORDER BY count DESC
    `);

    // Get document completion statistics
    const documentStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN idpic IS NOT NULL THEN 1 END) as with_id_pic,
        COUNT(CASE WHEN birth_certificate_doc IS NOT NULL THEN 1 END) as with_birth_cert,
        COUNT(CASE WHEN form137_doc IS NOT NULL THEN 1 END) as with_form137,
        COUNT(CASE WHEN idpic IS NOT NULL AND birth_certificate_doc IS NOT NULL AND form137_doc IS NOT NULL THEN 1 END) as complete_documents
      FROM enrollments
    `);

    // Calculate summary statistics
    const totalEnrollments = programStatsResult.rows.reduce((sum, program) => sum + parseInt(program.total_enrollments), 0);
    const totalVerified = programStatsResult.rows.reduce((sum, program) => sum + parseInt(program.verified_enrollments), 0);
    const totalPending = programStatsResult.rows.reduce((sum, program) => sum + parseInt(program.pending_enrollments), 0);
    const totalRejected = programStatsResult.rows.reduce((sum, program) => sum + parseInt(program.rejected_enrollments), 0);

    res.status(200).json({
      totalEnrollments,
      totalVerified,
      totalPending,
      totalRejected,
      recentEnrollments: recentEnrollmentsResult.rows,
      enrollmentStats: {
        programStats: programStatsResult.rows,
        yearLevelStats: yearLevelStatsResult.rows,
        monthlyData: enrollmentStatsResult.rows,
        statusDistribution: enrollmentStatusStatsResult.rows,
        documentStats: documentStatsResult.rows[0]
      }
    });

  } catch (error) {
    console.error('Error fetching registrar dashboard data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch registrar dashboard data',
      details: error.message
    });
  }
}; 