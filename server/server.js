import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import documentsRouter from './routes/documents.js';
import chatRouter from './routes/chat.js';
import aiFeaturesRouter from './routes/ai-features.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/documents', documentsRouter);
app.use('/api/documents', chatRouter);
app.use('/api/documents', aiFeaturesRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
