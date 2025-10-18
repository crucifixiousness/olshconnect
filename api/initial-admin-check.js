// api/initial-admin-check.js

const { Pool } = require('pg');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
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
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};
