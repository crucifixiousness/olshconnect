// api/enroll.js

const { Pool } = require('pg');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}).fields([
  { name: 'idpic', maxCount: 1 },
  { name: 'birthCertificateDoc', maxCount: 1 },
  { name: 'form137Doc', maxCount: 1 }
]);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

const handler = async (req, res) => {
  if (req.method === 'PUT') {
    try {
      const { id } = req.user;
      const { programs, yearLevel } = req.body;
      
      const currentYear = new Date().getFullYear();
      const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;
      const defaultSemester = '1st';

      const semester = req.body.semester || defaultSemester;
      const academic_year = req.body.academic_year || defaultAcademicYear;
      
      if (!programs || !yearLevel) {
        return res.status(400).json({ 
          error: "Program and year level are required" 
        });
      }

      const client = await pool.connect();
      await client.query('BEGIN');

      try {
        // Get year_id based on program and year level
        const yearResult = await client.query(
          "SELECT year_id FROM program_year WHERE program_id = $1 AND year_level = $2",
          [programs, yearLevel]
        );

        let year_id;
        if (yearResult.rows.length === 0) {
          const paddedYearLevel = String(yearLevel).padStart(2, '0');
          year_id = parseInt(programs + paddedYearLevel);
          
          await client.query(
            "INSERT INTO program_year (year_id, program_id, year_level) VALUES ($1, $2, $3)",
            [year_id, programs, yearLevel]
          );
        } else {
          year_id = yearResult.rows[0].year_id;
        }

        // Process file uploads
        const idpic = req.files?.idpic?.[0]?.buffer || null;
        const birthCertificateDoc = req.files?.birthCertificateDoc?.[0]?.buffer || null;
        const form137Doc = req.files?.form137Doc?.[0]?.buffer || null;

        // Check for existing enrollment
        const existingEnrollment = await client.query(
          "SELECT enrollment_id FROM enrollments WHERE student_id = $1 AND academic_year = $2",
          [id, academic_year]
        );

        if (existingEnrollment.rows.length > 0) {
          return res.status(400).json({
            error: "Student is already enrolled for this academic year"
          });
        }

        // Insert enrollment record
        await client.query(
          `INSERT INTO enrollments 
           (student_id, program_id, year_id, semester, enrollment_status, 
            enrollment_date, idpic, birth_certificate_doc, form137_doc, 
            payment_status, academic_year) 
           VALUES ($1, $2, $3, $4, 'Pending', NOW(), $5, $6, $7, 'Unpaid', $8)`,
          [id, programs, year_id, semester, idpic, birthCertificateDoc, form137Doc, academic_year]
        );

        await client.query('COMMIT');
        res.json({ 
          message: "Enrollment submitted successfully",
          status: "Pending",
          semester: semester,
          academic_year: academic_year
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error in enrollment:", error);
      res.status(500).json({ 
        error: "Failed to process enrollment",
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

module.exports = (req, res) => {
  authenticateJWT(req, res, () => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "File upload error" });
      } else if (err) {
        return res.status(500).json({ error: "Server error during file upload" });
      }
      handler(req, res);
    });
  });
};