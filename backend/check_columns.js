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

async function main() {
  try {
    const tasksCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
    `);
    console.log('Columns in table "tasks":');
    tasksCols.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));

    const historyCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'task_status_history'
    `);
    console.log('\nColumns in table "task_status_history":');
    historyCols.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));

  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
main();
