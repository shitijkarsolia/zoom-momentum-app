import { Router } from 'express';
import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export const aiRouter = Router();

const FALLBACK_POLLS = [
  {
    question: 'How well do you understand the current topic?',
    options: ['Completely clear', 'Mostly understand', 'Somewhat confused', 'Totally lost'],
  },
  {
    question: 'What pace would you prefer for the rest of this lecture?',
    options: ['Speed up', 'Current pace is fine', 'Slow down a bit', 'Please review the last topic'],
  },
  {
    question: 'Which best describes your engagement right now?',
    options: ['Fully engaged', 'Mostly following along', 'Zoning out a bit', 'Need a break'],
  },
];

// POST /api/ai/poll-generate — Generate check-in poll question
aiRouter.post('/poll-generate', async (req, res) => {
  const { context, currentTopic } = req.body;

  try {
    const prompt = `Generate a single multiple-choice check-in poll question for a live college lecture.
${currentTopic ? `Current topic: ${currentTopic}` : ''}
${context ? `Additional context from the professor: ${context}` : ''}

The poll should gauge student understanding or engagement. Return valid JSON only with this exact structure:
{"question": "...", "options": ["option1", "option2", "option3", "option4"]}

Rules:
- Exactly 4 options
- Options should be concise (under 10 words each)
- The question should be clear and relevant to the lecture context
- If context is about a specific concept, ask about understanding of that concept`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);
    if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
      throw new Error('Invalid poll format from AI');
    }

    res.json({ question: parsed.question, options: parsed.options });
  } catch (err) {
    console.error('[ai] poll-generate error:', err);
    const fallback = FALLBACK_POLLS[Math.floor(Math.random() * FALLBACK_POLLS.length)]!;
    res.json({ question: fallback.question, options: fallback.options, fallback: true });
  }
});

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
