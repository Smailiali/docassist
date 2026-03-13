import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function testConnection() {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
}

export default pool;
