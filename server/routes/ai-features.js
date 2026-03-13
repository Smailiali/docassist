import { Router } from 'express';
import pool from '../db/index.js';
import { complete } from '../services/claude.js';
import { summaryPrompt, keyTermsPrompt, deadlinesPrompt } from '../services/prompts.js';

const router = Router();

// POST /api/documents/:id/summary
router.post('/:id/summary', async (req, res) => {
  // TODO: generate and store summary
  res.status(501).json({ error: 'Not implemented yet' });
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
