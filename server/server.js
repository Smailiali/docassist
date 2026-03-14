import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from './config/passport.js';
import pool from './db/index.js';
import documentsRouter from './routes/documents.js';
import chatRouter from './routes/chat.js';
import aiFeaturesRouter from './routes/ai-features.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';
import { testConnection } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 3002;

const PgSession = connectPgSimple(session);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());

app.use(session({
  store: new PgSession({ pool, createTableIfMissing: false }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRouter);
app.use('/api/documents', requireAuth, documentsRouter);
app.use('/api/documents', requireAuth, chatRouter);
app.use('/api/documents', requireAuth, aiFeaturesRouter);

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
