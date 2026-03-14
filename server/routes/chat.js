import { Router } from 'express';
import pool from '../db/index.js';
import { streamChat } from '../services/claude.js';
import { chatPrompt } from '../services/prompts.js';

const router = Router();

// ~150K tokens ≈ 600K characters — truncate beyond this
const MAX_CHARS = 600_000;

// POST /api/documents/:id/chat
router.post('/:id/chat', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Fetch document — scoped to current user
  let docResult;
  try {
    docResult = await pool.query(
      'SELECT text_content FROM documents WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
  } catch (err) {
    console.error('DB error fetching document:', err);
    return res.status(500).json({ error: 'Failed to load document' });
  }

  if (docResult.rows.length === 0) {
    return res.status(404).json({ error: 'Document not found' });
  }

  let { text_content } = docResult.rows[0];
  let truncated = false;
  if (text_content.length > MAX_CHARS) {
    text_content = text_content.slice(0, MAX_CHARS);
    truncated = true;
  }

  // Fetch message history
  let history = [];
  try {
    const histResult = await pool.query(
      'SELECT role, content FROM messages WHERE document_id = $1 ORDER BY created_at ASC',
      [id]
    );
    history = histResult.rows.map((r) => ({ role: r.role, content: r.content }));
  } catch (err) {
    console.error('DB error fetching history:', err);
    // non-fatal — continue without history
  }

  // Save user message before streaming
  try {
    await pool.query(
      'INSERT INTO messages (document_id, role, content) VALUES ($1, $2, $3)',
      [id, 'user', message]
    );
  } catch (err) {
    console.error('DB error saving user message:', err);
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (truncated) {
    res.write(
      `data: ${JSON.stringify({ text: '⚠️ This document is very large and has been truncated for analysis.\n\n' })}\n\n`
    );
  }

  // Stream Claude response
  const messages = [...history, { role: 'user', content: message }];
  let assistantText = '';
  try {
    assistantText = await streamChat(chatPrompt(text_content), messages, res);
  } catch (err) {
    console.error('Streaming error:', err);
    res.write(`data: ${JSON.stringify({ text: '\n\n[Error: failed to get response from AI]' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }

  // Save assistant message
  if (assistantText) {
    try {
      await pool.query(
        'INSERT INTO messages (document_id, role, content) VALUES ($1, $2, $3)',
        [id, 'assistant', assistantText]
      );
    } catch (err) {
      console.error('DB error saving assistant message:', err);
    }
  }
});

// GET /api/documents/:id/messages
router.get('/:id/messages', async (req, res) => {
  try {
    // Verify document belongs to user before returning messages
    const docCheck = await pool.query(
      'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (docCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const result = await pool.query(
      'SELECT id, role, content, created_at FROM messages WHERE document_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('DB error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
