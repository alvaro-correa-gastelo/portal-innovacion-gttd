/**
 * Introspect DB schema safely from Node (no PowerShell -e quoting issues).
 * Usage:
 *   node scripts/introspect-db.js "postgres://USER:PASS@HOST:5432/DB"
 * If no URL is passed, it will try env vars DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME.
 */
const { Client } = require('pg');

function buildUrlFromEnv() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'postgres';
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function main() {
  const url = process.argv[2] || process.env.DATABASE_URL || buildUrlFromEnv();

  const client = new Client({
    connectionString: url,
    ssl: false,
  });

  try {
    console.log('▶ Connecting to:', url.replace(/:(.*?)@/, '://*****@'));
    await client.connect();
    const ping = await client.query('select current_database() as db, current_user as usr, version();');
    console.log('✔ Connected:', ping.rows[0]);

    console.log('\n# Tables in public schema');
    const qTables = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const tablesRes = await client.query(qTables);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.table(tablesRes.rows);

    const targets = Array.from(new Set([
      'session_states',
      'conversation_messages',
      'users',
      'configurations',
      ...tables, // also dump any other tables present
    ]));

    for (const name of targets) {
      try {
        const colsRes = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [name]);
        if (colsRes.rows.length) {
          console.log(`\n## Table: ${name}`);
          console.table(colsRes.rows);
          const cntRes = await client.query(`SELECT count(*)::int AS count FROM ${name};`);
          console.log('Rows:', cntRes.rows[0].count);
        }
      } catch (e) {
        // ignore non-existent tables
      }
    }

    // Samples for known tables
    for (const name of ['session_states', 'conversation_messages']) {
      try {
        const sample = await client.query(`SELECT * FROM ${name} ORDER BY 1 DESC LIMIT 5;`);
        if (sample.rows.length) {
          console.log(`\n-- Sample from ${name} --`);
          console.dir(sample.rows, { depth: null });
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error('✖ Introspection error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
