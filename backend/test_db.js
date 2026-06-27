const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  console.log('🔍 Checking Supabase Connectivity...');
  try {
    const res = await pool.query('SELECT current_database(), current_user');
    console.log('✅ DATABASE CONNECTED:', res.rows[0]);

    const users = await pool.query('SELECT first_name, email, role FROM users');
    console.log('\n👥 USERS FOUND IN DATABASE:');
    if (users.rows.length === 0) {
      console.log('❌ NO USERS FOUND! The database is empty.');
    } else {
      users.rows.forEach(u => console.log(`- ${u.first_name} (${u.email}) [${u.role}]`));
    }

    const verticals = await pool.query('SELECT count(*) FROM verticals');
    console.log('\n🏢 VERTICALS FOUND:', verticals.rows[0].count);

  } catch (err) {
    console.error('❌ CONNECTION FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
