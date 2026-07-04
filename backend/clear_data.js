const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

async function clearData() {
  try {
    console.log('Connecting to Live Database to clear logs and data...');
    
    // 1. Delete comments, attachments, status history, assignments, and tasks
    console.log('Deleting task-related comments...');
    await pool.query('DELETE FROM task_comments');

    console.log('Deleting task-related attachments...');
    await pool.query('DELETE FROM task_attachments');

    console.log('Deleting task status histories...');
    await pool.query('DELETE FROM task_status_history');

    console.log('Deleting task assignments...');
    await pool.query('DELETE FROM task_assignments');

    console.log('Deleting all tasks...');
    await pool.query('DELETE FROM tasks');

    // 2. Delete users except for the primary admin account
    console.log('Deleting all users except the admin (admin@ips.com)...');
    await pool.query("DELETE FROM users WHERE email != 'admin@ips.com'");

    console.log('✅ Database successfully cleared! Only admin and vertical data remain.');

  } catch (err) {
    console.error('❌ Data clear failed:', err.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

clearData();
