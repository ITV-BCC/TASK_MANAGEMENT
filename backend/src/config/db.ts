import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration for Secure Cloud / Local connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  // VERY IMPORTANT for Supabase/Cloud connections:
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
});

// Test Connection Immediately
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database Initialization Failed:', err.stack);
  }
  console.log('✅ Connected to Secure PostgreSQL Infrastructure');
  release();
});

export default pool;
