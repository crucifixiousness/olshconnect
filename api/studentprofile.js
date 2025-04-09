// api/studentprofile.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const client = await pool.connect();
      const { id } = req.user;

      // Get student basic info
      const studentResult = await client.query(
        `SELECT username, password, first_name, middle_name, last_name, 
                suffix, birthdate, age, place_of_birth, religion,
                email, contact_number AS number, full_address AS street_text, 
                guardian_name, guardian_contact_no
         FROM students WHERE id = $1`,
        [id]
      );

      if (studentResult.rows.length === 0) {
        return res.status(404).send("Student not found");
      }

      // Get latest enrollment info
      const enrollmentResult = await client.query(
        `SELECT e.*, p.program_name, py.year_level, 
                e.idpic, e.birth_certificate_doc, e.form137_doc
         FROM enrollments e
         JOIN program p ON e.program_id = p.program_id
         JOIN program_year py ON e.year_id = py.year_id
         WHERE e.student_id = $1
         ORDER BY e.enrollment_date DESC
         LIMIT 1`,
        [id]
      );

      const studentData = {
        userName: studentResult.rows[0].username,
        password: studentResult.rows[0].password,
        firstName: studentResult.rows[0].first_name,
        middleName: studentResult.rows[0].middle_name,
        lastName: studentResult.rows[0].last_name,
        suffix: studentResult.rows[0].suffix,
        birthdate: studentResult.rows[0].birthdate,
        age: studentResult.rows[0].age,
        placeOfBirth: studentResult.rows[0].place_of_birth,
        religion: studentResult.rows[0].religion,
        email: studentResult.rows[0].email,
        number: studentResult.rows[0].number,
        street_text: studentResult.rows[0].street_text,
        guardianName: studentResult.rows[0].guardian_name,
        guardianContactNo: studentResult.rows[0].guardian_contact_no,
        enrollment: enrollmentResult.rows[0] ? {
          program: enrollmentResult.rows[0].program_name,
          yearLevel: enrollmentResult.rows[0].year_level,
          status: enrollmentResult.rows[0].enrollment_status,
          idpic: enrollmentResult.rows[0].idpic ? Buffer.from(enrollmentResult.rows[0].idpic).toString('base64') : null
        } : null
      };

      res.json(studentData);
      client.release();
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).send("Server error");
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};