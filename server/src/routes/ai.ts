import { Router } from 'express';

export const aiRouter = Router();

// POST /api/ai/topic-segment — Analyze transcript for topic changes
aiRouter.post('/topic-segment', async (_req, res) => {
  // TODO: Implement with OpenAI integration
  res.json({ topicChanged: false, message: 'AI service not yet implemented' });
});

// POST /api/ai/quiz-generate — Generate quiz questions from transcript
aiRouter.post('/quiz-generate', async (_req, res) => {
  // TODO: Implement with OpenAI integration
  res.json({ questions: [], message: 'AI service not yet implemented' });
});

// POST /api/ai/poll-generate — Generate check-in poll question
aiRouter.post('/poll-generate', async (_req, res) => {
  // TODO: Implement with OpenAI integration
  res.json({ question: '', options: [], message: 'AI service not yet implemented' });
});

// POST /api/ai/recovery-pack — Generate recovery pack from bookmarks
aiRouter.post('/recovery-pack', async (_req, res) => {
  // TODO: Implement with OpenAI integration
  res.json({ items: [], message: 'AI service not yet implemented' });
});

// POST /api/ai/detect-cues — Detect professor importance cues
aiRouter.post('/detect-cues', async (_req, res) => {
  // TODO: Implement with OpenAI integration
  res.json({ hasCue: false, message: 'AI service not yet implemented' });
});
