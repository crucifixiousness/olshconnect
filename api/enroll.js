// api/enroll.js

const { Pool } = require('pg');
const formidable = require('formidable');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;

export const config = {
  api: {
    bodyParser: false, // Required for formidable to parse multipart form-data
  },
};

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
  if (req.method === 'PUT') {
    let client;
    try {
      const decoded = authenticateToken(req, res);
      req.user = decoded;
      const { id } = req.user;

      const form = new formidable.IncomingForm({
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
        allowEmptyFiles: false,
        filter: ({ mimetype }) => {
          return mimetype && (mimetype.includes('image/') || mimetype === 'application/pdf');
        }
      });

      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      if (!fields.programs || !fields.yearLevel || !fields.semester || !fields.academic_year) {
        return res.status(400).json({ 
          error: "Program, year level, semester, and academic year are required" 
        });
      }

      client = await pool.connect();
      await client.query('BEGIN');

      const programResult = await client.query(
        "SELECT program_id FROM program WHERE program_id = $1",
        [fields.programs]
      );

      if (programResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: "Selected program does not exist"
        });
      }

      const yearResult = await client.query(
        "SELECT year_id FROM program_year WHERE program_id = $1 AND year_level = $2",
        [fields.programs, fields.yearLevel]
      );

      let year_id;
      if (yearResult.rows.length === 0) {
        const paddedYearLevel = String(fields.yearLevel).padStart(2, '0');
        year_id = parseInt(fields.programs + paddedYearLevel);
        
        await client.query(
          "INSERT INTO program_year (year_id, program_id, year_level) VALUES ($1, $2, $3)",
          [year_id, fields.programs, fields.yearLevel]
        );
      } else {
        year_id = yearResult.rows[0].year_id;
      }

      const idpic = files.idpic ? await fs.readFile(files.idpic[0].filepath) : null;
      const birthCertificateDoc = files.birthCertificateDoc ? 
        await fs.readFile(files.birthCertificateDoc[0].filepath) : null;
      const form137Doc = files.form137Doc ? 
        await fs.readFile(files.form137Doc[0].filepath) : null;

      const existingEnrollment = await client.query(
        "SELECT enrollment_id FROM enrollments WHERE student_id = $1 AND academic_year = $2 AND semester = $3",
        [id, fields.academic_year, fields.semester]
      );

      if (existingEnrollment.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: "Student is already enrolled for this semester and academic year"
        });
      }

      const enrollmentResult = await client.query(
        `INSERT INTO enrollments 
         (student_id, program_id, year_id, semester, enrollment_status, 
          enrollment_date, idpic, birth_certificate_doc, form137_doc, 
          payment_status, academic_year) 
         VALUES ($1, $2, $3, $4, 'Pending', NOW(), $5, $6, $7, 'Unpaid', $8)
         RETURNING enrollment_id`,
        [id, fields.programs, year_id, fields.semester, idpic, birthCertificateDoc, form137Doc, fields.academic_year]
      );

      await client.query('COMMIT');

      // Clean up temp files
      await Promise.all(Object.values(files).map(fileArray => 
        fileArray.map(file => fs.unlink(file.filepath))
      ).flat());
      
      res.json({ 
        message: "Enrollment submitted successfully",
        status: "Pending",
        enrollment_id: enrollmentResult.rows[0].enrollment_id,
        semester: fields.semester,
        academic_year: fields.academic_year
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
