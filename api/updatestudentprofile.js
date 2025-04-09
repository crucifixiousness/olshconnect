// api/updatestudentprofile.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method === 'PUT') {
    const { id } = req.user;
    const {
      firstName,
      middleName,
      lastName,
      suffix,
      religion,
      email,
      number,
      street_text,
      guardianName,
      guardianContactNo,
    } = req.body;

    try {
      const client = await pool.connect();

      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (suffix !== undefined) {
        updateFields.push(`suffix = $${paramCount}`);
        updateValues.push(suffix);
        paramCount++;
      }

      if (firstName) {
        updateFields.push(`first_name = $${paramCount}`);
        updateValues.push(firstName);
        paramCount++;
      }

      if (middleName) {
        updateFields.push(`middle_name = $${paramCount}`);
        updateValues.push(middleName);
        paramCount++;
      }

      if (lastName) {
        updateFields.push(`last_name = $${paramCount}`);
        updateValues.push(lastName);
        paramCount++;
      }

      if (religion) {
        updateFields.push(`religion = $${paramCount}`);
        updateValues.push(religion);
        paramCount++;
      }

      if (email) {
        updateFields.push(`email = $${paramCount}`);
        updateValues.push(email);
        paramCount++;
      }

      if (number) {
        updateFields.push(`contact_number = $${paramCount}`);
        updateValues.push(number);
        paramCount++;
      }

      if (street_text) {
        updateFields.push(`full_address = $${paramCount}`);
        updateValues.push(street_text);
        paramCount++;
      }

      if (guardianName) {
        updateFields.push(`guardian_name = $${paramCount}`);
        updateValues.push(guardianName);
        paramCount++;
      }

      if (guardianContactNo) {
        updateFields.push(`guardian_contact_no = $${paramCount}`);
        updateValues.push(guardianContactNo);
        paramCount++;
      }

      if (updateFields.length === 0) {
        return res.status(400).send("No fields to update");
      }

      updateValues.push(id);

      const updateQuery = `
        UPDATE students 
        SET ${updateFields.join(", ")}
        WHERE id = $${paramCount}
      `;

      await client.query(updateQuery, updateValues);

      const result = await client.query(
        `SELECT username, password, first_name, middle_name, last_name, suffix, 
                birthdate, age, place_of_birth, religion, email, 
                contact_number AS number, full_address AS street_text, 
                guardian_name, guardian_contact_no
         FROM students WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).send("Student not found");
      }

      res.json(result.rows[0]);
      client.release();
    } catch (error) {
      console.error("Error updating student profile:", error);
      res.status(500).send("Server error");
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};