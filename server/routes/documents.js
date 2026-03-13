import { Router } from 'express';
import upload from '../middleware/upload.js';
import pool from '../db/index.js';
import { extractTextFromPDF } from '../services/pdf.js';

const router = Router();

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  // TODO: extract text, store in DB
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/documents
router.get('/', async (req, res) => {
  // TODO: return list of documents
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/documents/:id
router.get('/:id', async (req, res) => {
  // TODO: return single document
  res.status(501).json({ error: 'Not implemented yet' });
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  // TODO: delete document and chat history
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
