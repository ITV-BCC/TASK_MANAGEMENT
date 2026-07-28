const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:Bharatcareerconnect@2025@db.koodapnynppnskvvoenb.supabase.co:6543/postgres"
});

async function migrate() {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS modules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            vertical_id UUID REFERENCES verticals(id) ON DELETE CASCADE,
            code VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE SET NULL;
    `);
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
