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
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

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
