/**
 * One-time script: clean up existing document titles in the DB.
 * Run from the server/ directory:
 *   node scripts/fix-titles.js
 */
import 'dotenv/config';
import pool from '../db/index.js';

function cleanTitle(raw) {
  // Strip common file extensions if still present
  let title = raw.replace(/\.[a-z]{2,4}$/i, '');
  // Remove UUID patterns (e.g. -d89a6341-71bb-4066-99cf-e7a8feb7af7b)
  title = title.replace(/[-_][0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/gi, '');
  // Replace underscores and hyphens with spaces
  title = title.replace(/[_-]+/g, ' ');
  // Collapse whitespace and trim
  title = title.trim().replace(/\s+/g, ' ');
  // Title case
  title = title.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return title || raw;
}

const { rows } = await pool.query('SELECT id, title FROM documents ORDER BY id');
console.log(`Found ${rows.length} document(s).\n`);

let updated = 0;
for (const { id, title } of rows) {
  const cleaned = cleanTitle(title);
  if (cleaned !== title) {
    await pool.query('UPDATE documents SET title = $1 WHERE id = $2', [cleaned, id]);
    console.log(`[${id}] "${title}" → "${cleaned}"`);
    updated++;
  } else {
    console.log(`[${id}] "${title}" — ok`);
  }
}

console.log(`\nDone. Updated ${updated} of ${rows.length} title(s).`);
await pool.end();
