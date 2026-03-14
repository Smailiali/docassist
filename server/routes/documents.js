import { Router } from 'express';
import path from 'path';
import upload from '../middleware/upload.js';
import pool from '../db/index.js';
import { extractTextFromPDF } from '../services/pdf.js';
import { analyzeDocument } from '../services/analyze.js';

const router = Router();

// POST /api/documents/upload
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const { text, pageCount } = await extractTextFromPDF(req.file.path);
    const title = path.basename(req.file.originalname, path.extname(req.file.originalname));

    const result = await pool.query(
      `INSERT INTO documents (title, file_path, text_content, page_count, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, file_path, page_count, created_at`,
      [title, req.file.path, text, pageCount, req.user.id]
    );

    const doc = result.rows[0];
    res.status(201).json(doc);

    // Fire-and-forget: pre-generate all AI features in the background
    analyzeDocument(doc.id, req.user.id).catch((err) =>
      console.error('Background analysis failed after upload:', err.message)
    );
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

// GET /api/documents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, page_count, created_at FROM documents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET /api/documents/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, file_path, page_count, summary, key_terms, deadlines, created_at
       FROM documents WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get error:', err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
