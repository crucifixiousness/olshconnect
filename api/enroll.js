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
    let connection;
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

      connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const [yearResult] = await connection.query(
          "SELECT year_id FROM program_year WHERE program_id = ? AND year_level = ?",
          [programs, yearLevel]
        );

        let year_id;
        if (yearResult.length === 0) {
          const paddedYearLevel = String(yearLevel).padStart(2, '0');
          year_id = parseInt(programs + paddedYearLevel);
          
          await connection.query(
            "INSERT INTO program_year (year_id, program_id, year_level) VALUES (?, ?, ?)",
            [year_id, programs, yearLevel]
          );
        } else {
          year_id = yearResult[0].year_id;
        }

        const idpic = req.files?.idpic?.[0]?.buffer || null;
        const birthCertificateDoc = req.files?.birthCertificateDoc?.[0]?.buffer || null;
        const form137Doc = req.files?.form137Doc?.[0]?.buffer || null;

        const [existingEnrollment] = await connection.query(
          "SELECT enrollment_id FROM enrollments WHERE student_id = ? AND academic_year = ?",
          [id, academic_year]
        );

        if (existingEnrollment.length > 0) {
          return res.status(400).json({
            error: "Student is already enrolled for this academic year"
          });
        }

        await connection.execute(
          `INSERT INTO enrollments 
           (student_id, program_id, year_id, semester, enrollment_status, 
            enrollment_date, idpic, birth_certificate_doc, form137_doc, 
            payment_status, academic_year) 
           VALUES (?, ?, ?, ?, 'Pending', NOW(), ?, ?, ?, 'Unpaid', ?)`,
          [id, programs, year_id, semester, idpic, birthCertificateDoc, form137Doc, academic_year]
        );

        await connection.commit();
        res.json({ 
          message: "Enrollment submitted successfully",
          status: "Pending",
          semester: semester,
          academic_year: academic_year
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
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
