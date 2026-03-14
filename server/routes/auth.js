import { Router } from 'express';
import passport from '../config/passport.js';

const router = Router();

// GET /api/auth/google — initiate OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback — Google redirects here
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  }
);

// GET /api/auth/me — return current user or 401
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { id, email, display_name, avatar_url } = req.user;
  res.json({ id, email, display_name, avatar_url });
});

// POST /api/auth/logout — destroy session
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

export default router;
