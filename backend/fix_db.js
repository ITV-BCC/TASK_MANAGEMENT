const { Pool } = require('pg');

// Hardcoding credentials for the one-time fix script since dotenv is having issues with paths
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'TaskManagement',
  password: '570526@Nj',
  port: 5432,
});

async function runFix() {
  try {
    console.log('Connecting to database...');
    // Add last_remark to tasks
    await pool.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_remark TEXT;');
    // Add remark to task_status_history
    await pool.query('ALTER TABLE task_status_history ADD COLUMN IF NOT EXISTS remark TEXT;');
    console.log('✅ Database tables updated successfully!');
  } catch (err) {
    console.error('❌ Error updating database:', err.message);
  } finally {
    process.exit();
  }
}

runFix();
