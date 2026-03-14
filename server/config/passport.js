import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db/index.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value;

        const existing = await pool.query(
          'SELECT * FROM users WHERE google_id = $1',
          [googleId]
        );

        if (existing.rows.length > 0) {
          return done(null, existing.rows[0]);
        }

        const result = await pool.query(
          `INSERT INTO users (google_id, email, display_name, avatar_url)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [googleId, email, displayName, avatarUrl]
        );

        return done(null, result.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || false);
  } catch (err) {
    done(err);
  }
});

export default passport;
