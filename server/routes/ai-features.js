import { Router } from 'express';
import pool from '../db/index.js';
import { complete } from '../services/claude.js';
import { summaryPrompt, keyTermsPrompt, deadlinesPrompt } from '../services/prompts.js';

const router = Router();

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

    // Return cached result unless forcing regeneration
    if (summary && !force) {
      return res.json(summary);
    }

    // Strip optional markdown code fence Claude sometimes adds
    function extractJSON(text) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      return match ? match[1].trim() : text.trim();
    }

    // Call Claude
    let parsed;
    const raw = await complete(summaryPrompt(text_content), 'Generate the summary.');
    try {
      parsed = JSON.parse(extractJSON(raw));
    } catch {
      // Retry once on parse failure
      const raw2 = await complete(summaryPrompt(text_content), 'Generate the summary.');
      try {
        parsed = JSON.parse(extractJSON(raw2));
      } catch {
        return res.status(500).json({ error: 'Failed to generate summary' });
      }
    }

    // Cache in DB
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
router.post('/:id/terms', async (req, res) => {
  // TODO: extract and store key terms
  res.status(501).json({ error: 'Not implemented yet' });
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
