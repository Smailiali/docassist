import { Router } from 'express';
import pool from '../db/index.js';
import { complete } from '../services/claude.js';
import { summaryPrompt, keyTermsPrompt, deadlinesPrompt } from '../services/prompts.js';

const router = Router();

// Strip optional markdown code fence Claude sometimes adds
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

// POST /api/documents/:id/summary
// Pass ?force=true to bypass cache and regenerate
router.post('/:id/summary', async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === 'true';

  try {
    const docResult = await pool.query(
      'SELECT text_content, summary FROM documents WHERE id = $1',
      [id]
    );
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { text_content, summary } = docResult.rows[0];

    if (summary && !force) {
      return res.json(summary);
    }

    let parsed;
    const raw = await complete(summaryPrompt(text_content), 'Generate the summary.');
    try {
      parsed = JSON.parse(extractJSON(raw));
    } catch {
      const raw2 = await complete(summaryPrompt(text_content), 'Generate the summary.');
      try {
        parsed = JSON.parse(extractJSON(raw2));
      } catch {
        return res.status(500).json({ error: 'Failed to generate summary' });
      }
    }

    await pool.query(
      'UPDATE documents SET summary = $1 WHERE id = $2',
      [JSON.stringify(parsed), id]
    );

    res.json(parsed);
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// POST /api/documents/:id/terms
// Pass ?force=true to bypass cache and regenerate
router.post('/:id/terms', async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === 'true';

  try {
    const docResult = await pool.query(
      'SELECT text_content, key_terms FROM documents WHERE id = $1',
      [id]
    );
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { text_content, key_terms } = docResult.rows[0];

    if (key_terms && !force) {
      return res.json(key_terms);
    }

    let parsed;
    const raw = await complete(keyTermsPrompt(text_content), 'Extract the key terms.');
    try {
      parsed = JSON.parse(extractJSON(raw));
    } catch {
      const raw2 = await complete(keyTermsPrompt(text_content), 'Extract the key terms.');
      try {
        parsed = JSON.parse(extractJSON(raw2));
      } catch {
        return res.status(500).json({ error: 'Failed to extract key terms' });
      }
    }

    await pool.query(
      'UPDATE documents SET key_terms = $1 WHERE id = $2',
      [JSON.stringify(parsed), id]
    );

    res.json(parsed);
  } catch (err) {
    console.error('Terms error:', err);
    res.status(500).json({ error: 'Failed to extract key terms' });
  }
});

// POST /api/documents/:id/deadlines
router.post('/:id/deadlines', async (req, res) => {
  // TODO: extract and store deadlines
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/documents/:id/export
router.get('/:id/export', async (req, res) => {
  // TODO: download extracted insights
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
