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

async function runAlter() {
  try {
    console.log('Connecting to Live Database to alter tables...');

    console.log('Adding "last_remark" to "tasks" table...');
    await pool.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS last_remark TEXT;
    `);
    console.log('✅ Column "last_remark" added to "tasks" table!');

    console.log('Adding "remark" to "task_status_history" table...');
    await pool.query(`
      ALTER TABLE task_status_history 
      ADD COLUMN IF NOT EXISTS remark TEXT;
    `);
    console.log('✅ Column "remark" added to "task_status_history" table!');

  } catch (err) {
    console.error('❌ Alter failed:', err.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

runAlter();
