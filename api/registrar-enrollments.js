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
  if (req.method === 'GET') {
    try {
      const decoded = authenticateToken(req, res);
      req.user = decoded;

      const client = await pool.connect();
      
      try {
        const { rows } = await client.query(
          `SELECT 
            e.enrollment_id as _id,
            e.student_id,
            e.program_id as programs,
            py.year_level as yearLevel,
            e.semester,
            e.enrollment_status as status,
            e.academic_year,
            e.idpic,
            e.birth_certificate_doc as birthCertificateDoc,
            e.form137_doc as form137Doc,
            s.first_name,
            s.middle_name,
            s.last_name,
            s.suffix
          FROM enrollments e
          JOIN students s ON e.student_id = s.id
          JOIN program_year py ON e.year_id = py.year_id
          ORDER BY e.enrollment_date DESC`
        );

        console.log('Raw data check:', rows.map(row => ({
          hasIdPic: !!row.idpic,
          hasBirthCert: !!row.birthCertificateDoc,
          hasForm137: !!row.form137Doc
        })));

        // Transform the binary data to base64 and format student info
        const enrollments = rows.map(row => {
          // Log raw document data
          console.log('Processing document data:', {
            idpicType: row.idpic ? typeof row.idpic : 'null',
            birthCertType: row.birthCertificateDoc ? typeof row.birthCertificateDoc : 'null',
            form137Type: row.form137Doc ? typeof row.form137Doc : 'null'
          });

          return {
            ...row,
            idpic: row.idpic ? Buffer.from(row.idpic).toString('base64') : null,
            birthCertificateDoc: row.birthCertificateDoc ? Buffer.from(row.birthCertificateDoc).toString('base64') : null,
            form137Doc: row.form137Doc ? Buffer.from(row.form137Doc).toString('base64') : null,
            student: {
              firstName: row.first_name,
              middleName: row.middle_name,
              lastName: row.last_name,
              suffix: row.suffix
            }
          };
        });

        // Log transformed data
        console.log('Transformed data check:', enrollments.map(e => ({
          hasIdPic: !!e.idpic,
          hasBirthCert: !!e.birthCertificateDoc,
          hasForm137: !!e.form137Doc
        })));

        res.json(enrollments);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
