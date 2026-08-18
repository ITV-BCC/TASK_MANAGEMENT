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
  ssl: { rejectUnauthorized: false }
});

async function clearAllExceptVerticalsAndAdmin() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Data Reset Transaction...');
    await client.query('BEGIN');

    // 1. Delete attachments
    console.log('Deleting task attachments...');
    const attRes = await client.query('DELETE FROM task_attachments');
    console.log(`Deleted ${attRes.rowCount} attachments.`);

    // 2. Delete comments
    console.log('Deleting task comments...');
    const commRes = await client.query('DELETE FROM task_comments');
    console.log(`Deleted ${commRes.rowCount} comments.`);

    // 3. Delete task status history
    console.log('Deleting task status histories...');
    const histRes = await client.query('DELETE FROM task_status_history');
    console.log(`Deleted ${histRes.rowCount} history rows.`);

    // 4. Delete task assignments
    console.log('Deleting task assignments...');
    const assignRes = await client.query('DELETE FROM task_assignments');
    console.log(`Deleted ${assignRes.rowCount} assignments.`);

    // 5. Delete tasks
    console.log('Deleting all tasks...');
    const taskRes = await client.query('DELETE FROM tasks');
    console.log(`Deleted ${taskRes.rowCount} tasks.`);

    // 6. Delete modules
    console.log('Deleting all modules...');
    const modRes = await client.query('DELETE FROM modules');
    console.log(`Deleted ${modRes.rowCount} modules.`);

    // 7. Delete all users except primary GLOBAL_ADMIN (admin@ips.com)
    console.log('Deleting all non-admin users...');
    const userRes = await client.query("DELETE FROM users WHERE email != 'admin@ips.com' AND role != 'GLOBAL_ADMIN'");
    console.log(`Deleted ${userRes.rowCount} users.`);

    await client.query('COMMIT');
    console.log('\n✅ Transaction committed successfully!');

    // Verification
    console.log('\n--- Current Database Summary ---');
    const remainingUsers = await client.query('SELECT id, email, first_name, last_name, role FROM users');
    console.log('Remaining Users:');
    console.table(remainingUsers.rows);

    const remainingVerticals = await client.query('SELECT id, name FROM verticals ORDER BY name');
    console.log(`Remaining Verticals (${remainingVerticals.rowCount}):`);
    console.table(remainingVerticals.rows);

    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM tasks'),
      client.query('SELECT COUNT(*) FROM modules'),
      client.query('SELECT COUNT(*) FROM task_comments'),
      client.query('SELECT COUNT(*) FROM task_attachments')
    ]);

    console.log(`Tasks: ${counts[0].rows[0].count}`);
    console.log(`Modules: ${counts[0].rows[0].count}`);
    console.log(`Comments: ${counts[2].rows[0].count}`);
    console.log(`Attachments: ${counts[3].rows[0].count}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Reset failed and rolled back:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

clearAllExceptVerticalsAndAdmin();
