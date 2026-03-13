import { Router } from 'express';
import pool from '../db/index.js';
import { streamChat } from '../services/claude.js';
import { chatPrompt } from '../services/prompts.js';

const router = Router();

// POST /api/documents/:id/chat
router.post('/:id/chat', async (req, res) => {
  // TODO: stream AI response via SSE
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/documents/:id/messages
router.get('/:id/messages', async (req, res) => {
  // TODO: return chat history
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
