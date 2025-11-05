// api/admin-dashboard.js

const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Function to verify admin token
const verifyAdminToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const admin = await pool.query(
      'SELECT * FROM admins WHERE staff_id = $1 AND role = $2',
      [decoded.id, 'admin']
    );

    if (admin.rows.length === 0) {
      res.status(403).json({ message: "Admin access required" });
      return null;
    }

    return admin.rows[0];
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: "Invalid token" });
    return null;
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin token
    const admin = await verifyAdminToken(req, res);
    if (!admin) return; // Error response already sent

    const client = await pool.connect();

    // Get total enrolled students by program (only Officially Enrolled)
    const programStatsQuery = `
      SELECT 
        p.program_name,
        COUNT(CASE WHEN e.enrollment_status = 'Officially Enrolled' THEN 1 END) as student_count
      FROM program p
      LEFT JOIN enrollments e ON p.program_id = e.program_id
      GROUP BY p.program_id, p.program_name
      ORDER BY p.program_name
    `;

    const programStatsResult = await client.query(programStatsQuery);

    // Get total enrolled students
    const totalStudentsQuery = `
      SELECT COUNT(DISTINCT e.student_id) as total_students
      FROM enrollments e
      WHERE e.enrollment_status = 'Officially Enrolled'
    `;

    const totalStudentsResult = await client.query(totalStudentsQuery);
    const totalStudents = parseInt(totalStudentsResult.rows[0].total_students) || 0;

    // Get students by year level (only Officially Enrolled)
    const yearLevelStatsQuery = `
      SELECT 
        py.year_level,
        COUNT(DISTINCT e.student_id) as student_count
      FROM program_year py
      LEFT JOIN enrollments e ON py.year_id = e.year_id 
        AND e.enrollment_status = 'Officially Enrolled'
      GROUP BY py.year_level, py.year_id
      ORDER BY py.year_id
    `;

    const yearLevelStatsResult = await client.query(yearLevelStatsQuery);

    // Format program stats - combine BEED and BSEd into Education
    const programStats = {
      education: 0,
      bscrim: 0,
      bshm: 0,
      bsit: 0,
      bsoad: 0
    };
    
    programStatsResult.rows.forEach(row => {
      const programName = (row.program_name || '').toUpperCase();
      const studentCount = parseInt(row.student_count) || 0;
      
      // Combine BEED and BSEd into Education
      if (programName.includes('BEED') || programName.includes('ELEMENTARY EDUCATION') || 
          programName.includes('BSED') || programName.includes('SECONDARY EDUCATION') ||
          programName.includes('EDUCATION')) {
        programStats.education += studentCount;
      } else if (programName.includes('BSCRIM') || programName.includes('CRIMINOLOGY')) {
        programStats.bscrim = studentCount;
      } else if (programName.includes('BSHM') || programName.includes('HOSPITALITY MANAGEMENT')) {
        programStats.bshm = studentCount;
      } else if (programName.includes('BSIT') || programName.includes('INFORMATION TECHNOLOGY')) {
        programStats.bsit = studentCount;
      } else if (programName.includes('BSOAD') || programName.includes('OFFICE ADMINISTRATION')) {
        programStats.bsoad = studentCount;
      }
    });

    // Format year level stats
    const yearLevelStats = {
      firstYear: 0,
      secondYear: 0,
      thirdYear: 0,
      fourthYear: 0
    };

    yearLevelStatsResult.rows.forEach(row => {
      const yearLevel = parseInt(row.year_level);
      if (yearLevel === 1) {
        yearLevelStats.firstYear = parseInt(row.student_count) || 0;
      } else if (yearLevel === 2) {
        yearLevelStats.secondYear = parseInt(row.student_count) || 0;
      } else if (yearLevel === 3) {
        yearLevelStats.thirdYear = parseInt(row.student_count) || 0;
      } else if (yearLevel === 4) {
        yearLevelStats.fourthYear = parseInt(row.student_count) || 0;
      }
    });

    client.release();

    res.status(200).json({
      success: true,
      data: {
        programStats: {
          education: programStats.education || 0,
          bscrim: programStats.bscrim || 0,
          bshm: programStats.bshm || 0,
          bsit: programStats.bsit || 0,
          bsoad: programStats.bsoad || 0
        },
        totalStudents,
        yearLevelStats
      }
    });

  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({ 
      error: "Failed to fetch admin dashboard data",
      details: error.message 
    });
  }
};

