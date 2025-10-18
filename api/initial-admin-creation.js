// api/initial-admin-creation.js

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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Check availability endpoint
    if (req.url.includes('/check-availability')) {
      try {
        console.log('🔍 Checking initial admin availability...');
        const client = await pool.connect();
        
        // Check admins table for admin accounts
        console.log('📊 Querying admins table for admin role...');
        const result = await client.query(`
          SELECT COUNT(*) as admin_count 
          FROM admins 
          WHERE role = 'admin'
        `);
        
        console.log('📋 Query result:', result.rows);
        const adminCount = parseInt(result.rows[0].admin_count);
        console.log('🔢 Admin count:', adminCount);
        
        // Also check what's actually in the admins table
        const allAdmins = await client.query(`
          SELECT staff_id, staff_username, role 
          FROM admins 
          ORDER BY staff_id
        `);
        console.log('👥 All admins in table:', allAdmins.rows);
        
        client.release();
        
        const isAvailable = adminCount === 0;
        console.log('✅ Is available:', isAvailable);
        
        res.json({
          success: true,
          isAvailable,
          adminCount,
          debug: {
            queryResult: result.rows,
            allAdmins: allAdmins.rows
          },
          message: isAvailable 
            ? 'Initial admin creation is available' 
            : 'Admin accounts already exist'
        });
        
      } catch (error) {
        console.error('Error checking initial admin availability:', error);
        res.status(500).json({
          success: false,
          message: 'Error checking initial admin availability',
          error: error.message
        });
      }
    }
    // Form data endpoint
    else if (req.url.includes('/form-data')) {
      res.json({
        success: true,
        formData: {
          roles: [
            { value: 'admin', label: 'Admin' }
          ]
        }
      });
    }
    else {
      res.status(404).json({ success: false, message: 'Endpoint not found' });
    }
  }
  
  else if (req.method === 'POST') {
    // Create initial admin endpoint
    if (req.url.includes('/create-initial-admin')) {
      const { staff_username, staff_password, full_name, role = 'admin' } = req.body;
      
      // Validation
      if (!staff_username || !staff_password || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
          error: 'MISSING_FIELDS'
        });
      }
      
      if (staff_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
          error: 'WEAK_PASSWORD'
        });
      }
      
      try {
        const client = await pool.connect();
        
        // Check if username already exists
        const existingUser = await client.query(`
          SELECT staff_id FROM admins WHERE staff_username = $1
        `, [staff_username]);
        
        if (existingUser.rows.length > 0) {
          client.release();
          return res.status(400).json({
            success: false,
            message: 'Username already exists',
            error: 'USERNAME_EXISTS'
          });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(staff_password, saltRounds);
        
        // Create admin account
        const result = await client.query(`
          INSERT INTO admins (
            staff_username, 
            staff_password, 
            full_name, 
            role
          ) VALUES ($1, $2, $3, $4)
          RETURNING staff_id, staff_username, full_name, role
        `, [staff_username, hashedPassword, full_name, role]);
        
        const newAdmin = result.rows[0];
        
        client.release();
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            adminId: newAdmin.staff_id, 
            username: newAdmin.staff_username,
            role: newAdmin.role 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );
        
        res.json({
          success: true,
          message: 'Initial admin account created successfully',
          admin: {
            staff_id: newAdmin.staff_id,
            staff_username: newAdmin.staff_username,
            full_name: newAdmin.full_name,
            role: newAdmin.role
          },
          token
        });
        
      } catch (error) {
        console.error('Error creating initial admin:', error);
        res.status(500).json({
          success: false,
          message: 'Error creating initial admin account',
          error: error.message
        });
      }
    }
    else {
      res.status(404).json({ success: false, message: 'Endpoint not found' });
    }
  }
  
  else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
