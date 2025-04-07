// api/register.js

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Fetch the DB URL from environment variables
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const {
      userName,
      password,
      firstName,
      middleName,
      lastName,
      suffix,
      sex,
      birthdate,
      age,
      placeOfBirth,
      religion,
      email,
      number,
      street_text,
      guardianName,
      guardianContactNo,
    } = req.body;

    try {
      const client = await pool.connect();
      
      // Check if username exists
      const result = await client.query(
        'SELECT id FROM students WHERE username = $1',
        [userName]
      );
      
      if (result.rows.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert complete student data
      const insertResult = await client.query(
        `INSERT INTO students (
          username, password, first_name, middle_name, last_name,
          suffix, sex, birthdate, age, place_of_birth,
          religion, email, contact_number, full_address,
          guardian_name, guardian_contact_no, role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id`,
        [
          userName,
          hashedPassword,
          firstName,
          middleName,
          lastName,
          suffix,
          sex,
          birthdate,
          age,
          placeOfBirth,
          religion,
          email,
          number,
          street_text,
          guardianName,
          guardianContactNo,
          'student'
        ]
      );
      
      res.status(201).json({ 
        message: 'Account Added!',
        studentId: insertResult.rows[0].id 
      });
      
      client.release();
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Registration failed', 
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
