const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }
});

async function createMasterAdmin() {
  console.log('⚔️  Initializing Master Admin Creation...');
  try {
    // 1. Delete Existing
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@ips.com']);
    
    // 2. Hash Password (The RIGHT way)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);

    // 3. Insert fresh admin
    await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      ['IPS', 'Admin', 'admin@ips.com', hash, 'GLOBAL_ADMIN']
    );

    console.log('\n✨ MASTER ADMIN CREATED SUCCESSFULLY!');
    console.log('📧 Login Email: admin@ips.com');
    console.log('🔑 Login Password: admin123');
    console.log('\n🚀 Try logging in now through your browser!');

  } catch (err) {
    console.error('❌ FAILED TO CREATE ADMIN:', err.message);
  } finally {
    await pool.end();
  }
}

createMasterAdmin();
