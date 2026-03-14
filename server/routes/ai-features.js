import { Router } from 'express';
import pool from '../db/index.js';
import {
  generateSummaryForDoc,
  generateTermsForDoc,
  generateDeadlinesForDoc,
  analyzeDocument,
} from '../services/analyze.js';

const router = Router();

// POST /api/documents/:id/analyze
// Kicks off all three AI features concurrently in the background.
// Responds immediately with 202 — client does not wait.
router.post('/:id/analyze', (req, res) => {
  const { id } = req.params;
  res.status(202).json({ status: 'processing' });
  analyzeDocument(id, req.user.id).catch((err) =>
    console.error(`Analyze error (doc ${id}):`, err.message)
  );
});

// POST /api/documents/:id/summary
router.post('/:id/summary', async (req, res) => {
  try {
    const data = await generateSummaryForDoc(req.params.id, req.user.id, req.query.force === 'true');
    res.json(data);
  } catch (err) {
    if (err.message === 'Document not found') return res.status(404).json({ error: err.message });
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// POST /api/documents/:id/terms
router.post('/:id/terms', async (req, res) => {
  try {
    const data = await generateTermsForDoc(req.params.id, req.user.id, req.query.force === 'true');
    res.json(data);
  } catch (err) {
    if (err.message === 'Document not found') return res.status(404).json({ error: err.message });
    console.error('Terms error:', err);
    res.status(500).json({ error: 'Failed to extract key terms' });
  }
});

// POST /api/documents/:id/deadlines
router.post('/:id/deadlines', async (req, res) => {
  try {
    const data = await generateDeadlinesForDoc(req.params.id, req.user.id, req.query.force === 'true');
    res.json(data);
  } catch (err) {
    if (err.message === 'Document not found') return res.status(404).json({ error: err.message });
    console.error('Deadlines error:', err);
    res.status(500).json({ error: 'Failed to extract deadlines' });
  }
});

// GET /api/documents/:id/export?format=pdf|text
router.get('/:id/export', async (req, res) => {
  const { id } = req.params;
  const format = req.query.format === 'text' ? 'text' : 'pdf';

  try {
    const [docResult, msgResult] = await Promise.all([
      pool.query(
        'SELECT title, summary, key_terms, deadlines FROM documents WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      ),
      pool.query(
        'SELECT role, content FROM messages WHERE document_id = $1 ORDER BY created_at ASC',
        [id]
      ),
    ]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { title, summary, key_terms, deadlines } = docResult.rows[0];
    const messages = msgResult.rows;
    const exportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    // ── Plain text export ──────────────────────────────────────────────────
    if (format === 'text') {
      const lines = [];
      lines.push(title);
      lines.push(`Exported: ${exportDate}`);

      if (summary) {
        lines.push('');
        lines.push('=== SUMMARY ===');
        if (summary.document_type) lines.push(`Type: ${summary.document_type}`);
        if (summary.overview) { lines.push(''); lines.push(summary.overview); }
        if (summary.parties?.length) { lines.push(''); lines.push('Parties: ' + summary.parties.join(', ')); }
        if (summary.key_topics?.length) {
          lines.push('');
          lines.push('Key Topics:');
          summary.key_topics.forEach((t) => lines.push(`  - ${t}`));
        }
      }

      if (key_terms?.length) {
        lines.push('');
        lines.push('=== KEY TERMS ===');
        key_terms.forEach((t) => {
          lines.push(`${t.term} [${t.category}]`);
          if (t.context) lines.push(`  "${t.context}"`);
        });
      }

      if (deadlines?.length) {
        lines.push('');
        lines.push('=== DEADLINES ===');
        deadlines.forEach((d) => {
          lines.push(d.item);
          lines.push(`  Date: ${d.due_date} | Responsible: ${d.responsible_party} | Urgency: ${d.urgency}`);
        });
      }

      if (messages.length) {
        lines.push('');
        lines.push('=== CHAT HISTORY ===');
        messages.forEach((m) => {
          const prefix = m.role === 'user' ? 'You' : 'Assistant';
          lines.push(`${prefix}: ${m.content}`);
          lines.push('');
        });
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="docassist-${safeTitle}.txt"`);
      return res.send(lines.join('\n'));
    }

    // ── PDF export ─────────────────────────────────────────────────────────
    const { default: PDFDocument } = await import('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="docassist-${safeTitle}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#111827').text(title);
    doc.fontSize(10).font('Helvetica').fillColor('#9ca3af').text(`Exported ${exportDate}`);
    doc.fillColor('#111827');

    function hr() {
      doc.moveDown(0.8);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
      doc.moveDown(0.5);
    }

    function sectionHeading(text) {
      hr();
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1f2937').text(text);
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica').fillColor('#374151');
    }

    if (summary) {
      sectionHeading('Summary');
      if (summary.document_type) {
        doc.font('Helvetica-Bold').text('Document Type: ', { continued: true });
        doc.font('Helvetica').text(summary.document_type);
        doc.moveDown(0.3);
      }
      if (summary.overview) {
        doc.font('Helvetica-Bold').text('Overview');
        doc.moveDown(0.2);
        doc.font('Helvetica').text(summary.overview, { lineGap: 3 });
        doc.moveDown(0.3);
      }
      if (summary.parties?.length) {
        doc.font('Helvetica-Bold').text('Parties Involved: ', { continued: true });
        doc.font('Helvetica').text(summary.parties.join(', '));
        doc.moveDown(0.3);
      }
      if (summary.key_topics?.length) {
        doc.font('Helvetica-Bold').text('Key Topics');
        doc.moveDown(0.2);
        summary.key_topics.forEach((t) => doc.font('Helvetica').text(`  • ${t}`, { lineGap: 2 }));
      }
    }

    if (key_terms?.length) {
      sectionHeading('Key Terms');
      key_terms.forEach((t, i) => {
        if (i > 0) doc.moveDown(0.4);
        doc.font('Helvetica-Bold').fillColor('#111827').text(t.term, { continued: true });
        doc.font('Helvetica').fillColor('#6b7280').text(`  [${t.category}]`);
        doc.fillColor('#374151');
        if (t.context) doc.font('Helvetica').text(`"${t.context}"`, { lineGap: 2 });
      });
    }

    if (deadlines?.length) {
      sectionHeading('Deadlines & Obligations');
      deadlines.forEach((d, i) => {
        if (i > 0) doc.moveDown(0.4);
        doc.font('Helvetica-Bold').fillColor('#111827').text(d.item);
        doc.font('Helvetica').fillColor('#6b7280').text(
          `Due: ${d.due_date}  |  Responsible: ${d.responsible_party}  |  Urgency: ${d.urgency}`
        );
        doc.fillColor('#374151');
      });
    }

    if (messages.length) {
      sectionHeading('Chat History');
      messages.forEach((m, i) => {
        if (i > 0) doc.moveDown(0.5);
        const prefix = m.role === 'user' ? 'You' : 'Assistant';
        doc.font('Helvetica-Bold').fillColor('#111827').text(`${prefix}:`, { continued: true });
        doc.font('Helvetica').fillColor('#374151').text(` ${m.content}`, { lineGap: 3 });
      });
    }

    doc.end();
  } catch (err) {
    console.error('Export error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to export document' });
    }
  }
});

export default router;
