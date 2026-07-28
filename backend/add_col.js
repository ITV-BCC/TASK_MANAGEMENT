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

async function alterTable() {
    try {
        await pool.query('ALTER TABLE modules ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL');
        await pool.query('ALTER TABLE modules ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE');
        console.log('success');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
alterTable();
