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
    let client;
    try {
      const { id } = req.user;
      const { programs, yearLevel, semester, academic_year } = req.body;
      
      // Validate all required fields
      if (!programs || !yearLevel || !semester || !academic_year) {
        return res.status(400).json({ 
          error: "Program, year level, semester, and academic year are required" 
        });
      }

      client = await pool.connect();
      await client.query('BEGIN');

      // Check if program exists
      const programResult = await client.query(
        "SELECT program_id FROM program WHERE program_id = $1",
        [programs]
      );

      if (programResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: "Selected program does not exist"
        });
      }

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

      // Process file uploads with proper error handling
      const idpic = req.files?.idpic?.[0]?.buffer;
      const birthCertificateDoc = req.files?.birthCertificateDoc?.[0]?.buffer;
      const form137Doc = req.files?.form137Doc?.[0]?.buffer;

      // Check for existing enrollment with specific semester
      const existingEnrollment = await client.query(
        "SELECT enrollment_id FROM enrollments WHERE student_id = $1 AND academic_year = $2 AND semester = $3",
        [id, academic_year, semester]
      );

      if (existingEnrollment.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: "Student is already enrolled for this semester and academic year"
        });
      }

      // Insert enrollment record with RETURNING clause
      const enrollmentResult = await client.query(
        `INSERT INTO enrollments 
         (student_id, program_id, year_id, semester, enrollment_status, 
          enrollment_date, idpic, birth_certificate_doc, form137_doc, 
          payment_status, academic_year) 
         VALUES ($1, $2, $3, $4, 'Pending', NOW(), $5, $6, $7, 'Unpaid', $8)
         RETURNING enrollment_id`,
        [id, programs, year_id, semester, idpic, birthCertificateDoc, form137Doc, academic_year]
      );

      await client.query('COMMIT');
      
      res.json({ 
        message: "Enrollment submitted successfully",
        status: "Pending",
        enrollment_id: enrollmentResult.rows[0].enrollment_id,
        semester: semester,
        academic_year: academic_year
      });
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error("Error in enrollment:", error);
      res.status(500).json({ 
        error: "Failed to process enrollment",
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
