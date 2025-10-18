const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/olshco_db'
});

// Middleware to check if any admins exist
const checkNoAdminsExist = async (req, res, next) => {
  try {
    const client = await pool.connect();
    
    // Check if any admin accounts exist
    const result = await client.query(`
      SELECT COUNT(*) as admin_count 
      FROM admins 
      WHERE role IN ('admin', 'super_admin')
    `);
    
    client.release();
    
    const adminCount = parseInt(result.rows[0].admin_count);
    
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts already exist. Initial admin creation is not available.',
        error: 'ADMINS_EXIST'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin existence:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking admin status',
      error: error.message
    });
  }
};

// Route to check if initial admin creation is available
router.get('/check-availability', async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT COUNT(*) as admin_count 
      FROM admins 
      WHERE role IN ('admin', 'super_admin')
    `);
    
    client.release();
    
    const adminCount = parseInt(result.rows[0].admin_count);
    const isAvailable = adminCount === 0;
    
    res.json({
      success: true,
      isAvailable,
      adminCount,
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
});

// Route to create initial admin account
router.post('/create-initial-admin', checkNoAdminsExist, async (req, res) => {
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
  
  if (!['admin', 'super_admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either admin or super_admin',
      error: 'INVALID_ROLE'
    });
  }
  
  try {
    const client = await pool.connect();
    
    await client.query('BEGIN');
    
    // Check if username already exists
    const existingUser = await client.query(
      'SELECT staff_id FROM admins WHERE staff_username = $1',
      [staff_username]
    );
    
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
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
    
    // Create initial admin account
    const result = await client.query(`
      INSERT INTO admins (
        staff_username, 
        staff_password, 
        full_name, 
        role, 
        program_id,
        created_by,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING staff_id, staff_username, full_name, role, created_at
    `, [staff_username, hashedPassword, full_name, role]);
    
    const newAdmin = result.rows[0];
    
    // Log the initial admin creation
    await client.query(`
      INSERT INTO admin_audit_log (
        action, 
        target_admin_id, 
        performed_by, 
        description
      ) VALUES ($1, $2, NULL, $3)
    `, [
      'INITIAL_ADMIN_CREATED',
      newAdmin.staff_id,
      `Initial admin account created: ${newAdmin.full_name} (${newAdmin.staff_username})`
    ]);
    
    await client.query('COMMIT');
    client.release();
    
    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        staff_id: newAdmin.staff_id,
        staff_username: newAdmin.staff_username,
        role: newAdmin.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Initial admin account created successfully',
      admin: {
        staff_id: newAdmin.staff_id,
        staff_username: newAdmin.staff_username,
        full_name: newAdmin.full_name,
        role: newAdmin.role,
        created_at: newAdmin.created_at
      },
      token,
      loginMessage: 'You can now log in with your credentials'
    });
    
  } catch (error) {
    console.error('Error creating initial admin:', error);
    
    try {
      await client.query('ROLLBACK');
      client.release();
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating initial admin account',
      error: error.message
    });
  }
});

// Route to get initial admin creation form data (for UI)
router.get('/form-data', checkNoAdminsExist, async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get available programs for the form
    const programsResult = await client.query(`
      SELECT program_id, program_name 
      FROM programs 
      ORDER BY program_name
    `);
    
    client.release();
    
    res.json({
      success: true,
      formData: {
        programs: programsResult.rows,
        roles: [
          { value: 'admin', label: 'Admin' },
          { value: 'super_admin', label: 'Super Admin' }
        ]
      }
    });
    
  } catch (error) {
    console.error('Error getting initial admin form data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting form data',
      error: error.message
    });
  }
});

module.exports = router;
