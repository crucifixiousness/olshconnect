// api/loginstaff.js

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { staff_username, staff_password } = req.body;

    if (!staff_username || !staff_password) {
      return res.status(400).send("Username and password are required.");
    }

    try {
      const result = await pool.query(
        "SELECT * FROM admins WHERE staff_username = $1",
        [staff_username]
      );

      if (result.rows.length === 0) {
        return res.status(401).send("Invalid credentials.");
      }

      const staff = result.rows[0];
      const isMatch = await bcrypt.compare(staff_password, staff.staff_password);

      if (!isMatch) {
        return res.status(401).send("Invalid credentials.");
      }

      const token = jwt.sign(
        { id: staff.staff_id, staff_username: staff.staff_username, role: staff.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: {
          staff_id: staff.staff_id,
          id: staff.staff_id,
          staff_username: staff.staff_username,
          fullName: staff.full_name,
          role: staff.role,
          program_id: staff.program_id,
        },
      });
    } catch (error) {
      console.error("Error during staff login:", error);
      res.status(500).send("Server error");
    }
  } else {
    res.status(405).send("Method not allowed");
  }
};