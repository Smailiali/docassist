import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import documentsRouter from './routes/documents.js';
import chatRouter from './routes/chat.js';
import aiFeaturesRouter from './routes/ai-features.js';
import { testConnection } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

app.use('/api/documents', documentsRouter);
app.use('/api/documents', chatRouter);
app.use('/api/documents', aiFeaturesRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await testConnection();
    console.log('Database connection verified.');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
});
