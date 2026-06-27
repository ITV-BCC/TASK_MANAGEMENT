const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'TaskManagement',
  password: '570526@Nj',
  port: 5432,
});

async function runFix() {
  try {
    console.log('Creating attachments table...');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS task_attachments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
            uploaded_by UUID REFERENCES users(id),
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✅ Attachments table created successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit();
  }
}

runFix();
