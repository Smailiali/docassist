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
      'SELECT text_content, summary FROM documents WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
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
      'UPDATE documents SET summary = $1 WHERE id = $2 AND user_id = $3',
      [JSON.stringify(parsed), id, req.user.id]
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
      'SELECT text_content, key_terms FROM documents WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
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
      'UPDATE documents SET key_terms = $1 WHERE id = $2 AND user_id = $3',
      [JSON.stringify(parsed), id, req.user.id]
    );

    res.json(parsed);
  } catch (err) {
    console.error('Terms error:', err);
    res.status(500).json({ error: 'Failed to extract key terms' });
  }
});

// POST /api/documents/:id/deadlines
// Pass ?force=true to bypass cache and regenerate
router.post('/:id/deadlines', async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === 'true';

  try {
    const docResult = await pool.query(
      'SELECT text_content, deadlines FROM documents WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { text_content, deadlines } = docResult.rows[0];

    if (deadlines && !force) {
      return res.json(deadlines);
    }

    let parsed;
    const raw = await complete(deadlinesPrompt(text_content), 'Detect the deadlines.');
    try {
      parsed = JSON.parse(extractJSON(raw));
    } catch {
      const raw2 = await complete(deadlinesPrompt(text_content), 'Detect the deadlines.');
      try {
        parsed = JSON.parse(extractJSON(raw2));
      } catch {
        return res.status(500).json({ error: 'Failed to extract deadlines' });
      }
    }

    await pool.query(
      'UPDATE documents SET deadlines = $1 WHERE id = $2 AND user_id = $3',
      [JSON.stringify(parsed), id, req.user.id]
    );

    res.json(parsed);
  } catch (err) {
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

    // Header
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#111827').text(title);
    doc.fontSize(10).font('Helvetica').fillColor('#9ca3af').text(`Exported ${exportDate}`);
    doc.fillColor('#111827');

    function hr() {
      doc.moveDown(0.8);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .stroke();
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
        summary.key_topics.forEach((t) => {
          doc.font('Helvetica').text(`  • ${t}`, { lineGap: 2 });
        });
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
