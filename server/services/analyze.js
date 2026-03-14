import pool from '../db/index.js';
import { complete } from './claude.js';
import { summaryPrompt, keyTermsPrompt, deadlinesPrompt } from './prompts.js';

function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

async function parseWithRetry(promptFn, text, userMessage) {
  const raw = await complete(promptFn(text), userMessage);
  try {
    return JSON.parse(extractJSON(raw));
  } catch {
    const raw2 = await complete(promptFn(text), userMessage);
    return JSON.parse(extractJSON(raw2));
  }
}

export async function generateSummaryForDoc(docId, userId, force = false) {
  const { rows } = await pool.query(
    'SELECT text_content, summary FROM documents WHERE id = $1 AND user_id = $2',
    [docId, userId]
  );
  if (rows.length === 0) throw new Error('Document not found');
  const { text_content, summary } = rows[0];
  if (summary && !force) return summary;
  const parsed = await parseWithRetry(summaryPrompt, text_content, 'Generate the summary.');
  await pool.query(
    'UPDATE documents SET summary = $1 WHERE id = $2 AND user_id = $3',
    [JSON.stringify(parsed), docId, userId]
  );
  return parsed;
}

export async function generateTermsForDoc(docId, userId, force = false) {
  const { rows } = await pool.query(
    'SELECT text_content, key_terms FROM documents WHERE id = $1 AND user_id = $2',
    [docId, userId]
  );
  if (rows.length === 0) throw new Error('Document not found');
  const { text_content, key_terms } = rows[0];
  if (key_terms && !force) return key_terms;
  const parsed = await parseWithRetry(keyTermsPrompt, text_content, 'Extract the key terms.');
  await pool.query(
    'UPDATE documents SET key_terms = $1 WHERE id = $2 AND user_id = $3',
    [JSON.stringify(parsed), docId, userId]
  );
  return parsed;
}

export async function generateDeadlinesForDoc(docId, userId, force = false) {
  const { rows } = await pool.query(
    'SELECT text_content, deadlines FROM documents WHERE id = $1 AND user_id = $2',
    [docId, userId]
  );
  if (rows.length === 0) throw new Error('Document not found');
  const { text_content, deadlines } = rows[0];
  if (deadlines && !force) return deadlines;
  const parsed = await parseWithRetry(deadlinesPrompt, text_content, 'Detect the deadlines.');
  await pool.query(
    'UPDATE documents SET deadlines = $1 WHERE id = $2 AND user_id = $3',
    [JSON.stringify(parsed), docId, userId]
  );
  return parsed;
}

// In-progress guard — prevents the same document from being analyzed twice at once
const analyzing = new Set();

export async function analyzeDocument(docId, userId) {
  const key = `${userId}:${docId}`;
  if (analyzing.has(key)) return;
  analyzing.add(key);
  // Run sequentially so background analysis doesn't compete with user-initiated chat
  const steps = [
    ['summary', () => generateSummaryForDoc(docId, userId)],
    ['key terms', () => generateTermsForDoc(docId, userId)],
    ['deadlines', () => generateDeadlinesForDoc(docId, userId)],
  ];
  try {
    for (const [name, fn] of steps) {
      try {
        await fn();
      } catch (err) {
        console.error(`Background analysis failed for ${name} (doc ${docId}):`, err.message);
      }
    }
  } finally {
    analyzing.delete(key);
  }
}
