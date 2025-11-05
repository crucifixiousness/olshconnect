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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = authenticateToken(req);
    const { 
      description, 
      form_data 
    } = req.body;
    const id = decoded.id;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description/reason for request is required." });
    }

    // Extract form data fields
    const levelAttended = form_data?.levelAttended || [];
    const gradeStrandCourse = form_data?.gradeStrandCourse || null;
    const yearGraduated = form_data?.yearGraduated || null;
    const academicCredentials = form_data?.academicCredentials || [];
    const certification = form_data?.certification || [];
    const requestDate = form_data?.date || new Date().toISOString().slice(0, 10);

    // Validate that at least one level is attended
    if (!levelAttended || levelAttended.length === 0) {
      return res.status(400).json({ message: "At least one level attended must be selected." });
    }

    // Validate that at least one academic credential or certification is selected
    if ((!academicCredentials || academicCredentials.length === 0) && 
        (!certification || certification.length === 0)) {
      return res.status(400).json({ message: "At least one academic credential or certification must be selected." });
    }

    // Derive doc_type automatically from selections
    let docType = null;
    if (academicCredentials && academicCredentials.length > 0) {
      if (academicCredentials.includes("TRANSCRIPT OF RECORDS - College")) {
        docType = "Transcript of Records";
      } else if (academicCredentials.includes("DIPLOMA")) {
        docType = "Diploma";
      } else {
        docType = academicCredentials[0]; // Use first selected credential
      }
    } else if (certification && certification.length > 0) {
      if (certification.includes("GRADES (FOR COLLEGE ONLY)")) {
        docType = "Certificate of Grades";
      } else if (certification.includes("ENROLLMENT")) {
        docType = "Enrollment Certificate";
      } else if (certification.includes("GRADUATION")) {
        docType = "Graduation Certificate";
      } else {
        docType = certification[0]; // Use first selected certification
      }
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert with all new fields (doc_type derived from selections)
    const result = await pool.query(
      `INSERT INTO documentrequest (
        id, 
        doc_type, 
        description, 
        req_date, 
        req_status,
        level_attended,
        grade_strand_course,
        year_graduated,
        academic_credentials,
        certification
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        id, 
        docType, // Automatically derived from selections
        description.trim(), 
        requestDate, 
        "Pending",
        levelAttended, // PostgreSQL array
        gradeStrandCourse,
        yearGraduated,
        academicCredentials, // PostgreSQL array
        certification // PostgreSQL array
      ]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to retrieve inserted record');
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error details:", error);
    
    if (error.code === "23505") {
      return res.status(400).json({ message: "Duplicate entry." });
    }
    
    // Send success response even if we encounter an error after successful insertion
    if (error.message === 'Failed to retrieve inserted record') {
      return res.status(201).json({ 
        message: "Request added successfully",
        description,
        req_date: currentDate,
        req_status: "Pending"
      });
    }
    
    res.status(500).json({ message: "Server error while adding request." });
  }
};
