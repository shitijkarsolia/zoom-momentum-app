import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { aiRouter } from './routes/ai.js';
import { transcriptRouter } from './routes/transcript.js';
import { bookmarkRouter } from './routes/bookmarks.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set true in production with HTTPS
      httpOnly: true,
      sameSite: 'none' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);


// OWASP Security Headers
app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors https://*.zoom.us");
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/transcript', transcriptRouter);
app.use('/api/bookmarks', bookmarkRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`[server] running on http://localhost:${config.port}`);
});

export default app;
