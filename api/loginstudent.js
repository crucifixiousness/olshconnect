import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// PostgreSQL pool setup (adjust Neon credentials as needed)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    const studentQuery = `
      SELECT s.*, e.idpic
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      WHERE s.username = $1
      ORDER BY e.enrollment_date DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(studentQuery, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const idpicBase64 = user.idpic ? Buffer.from(user.idpic).toString('base64') : null;

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        fullName: `${user.first_name} ${user.last_name}`,
        role: user.role,
        idpic: idpicBase64,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
