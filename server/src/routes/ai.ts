import { Router } from 'express';
import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey, baseURL: config.openai.baseUrl });

export const aiRouter = Router();

/** Extract JSON from a response that may contain markdown fences or conversational text */
function extractJSON(text: string): any {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}
  // Try extracting from markdown code block
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) try { return JSON.parse(fenced[1].trim()); } catch {}
  // Try finding first { ... } or [ ... ]
  const braceMatch = text.match(/(\{[\s\S]*\})/);
  if (braceMatch) try { return JSON.parse(braceMatch[1]); } catch {}
  const bracketMatch = text.match(/(\[[\s\S]*\])/);
  if (bracketMatch) try { return JSON.parse(bracketMatch[1]); } catch {}
  throw new Error('Could not extract JSON from response');
}

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

The poll should gauge student understanding or engagement. Return ONLY valid JSON with this exact structure, no other text:
{"question": "...", "options": ["option1", "option2", "option3", "option4"]}

Rules:
- Exactly 4 options
- Options should be concise (under 10 words each)
- The question should be clear and relevant to the lecture context
- If context is about a specific concept, ask about understanding of that concept
- Return ONLY the JSON object, nothing else`;

    const completion = await openai.chat.completions.create({
      model: 'claude-sonnet-4.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from AI');
    }

    const parsed = extractJSON(content);
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
  // TODO: Implement with AI integration
  res.json({ topicChanged: false, message: 'AI service not yet implemented' });
});

const FALLBACK_QUIZ = [
  {
    question: 'What does the derivative of a function represent?',
    options: ['The area under the curve', 'The rate of change at a point', 'The y-intercept', 'The maximum value'],
    correctIndex: 1,
    explanation: 'The derivative measures the instantaneous rate of change of a function at any given point.',
  },
  {
    question: 'Using the power rule, what is the derivative of x³?',
    options: ['x²', '3x', '3x²', '3x³'],
    correctIndex: 2,
    explanation: 'The power rule says d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x².',
  },
  {
    question: 'What is the chain rule used for?',
    options: ['Adding derivatives', 'Differentiating composite functions', 'Finding integrals', 'Solving equations'],
    correctIndex: 1,
    explanation: 'The chain rule lets us differentiate compositions of functions: d/dx[f(g(x))] = f\'(g(x))·g\'(x).',
  },
  {
    question: 'What is the derivative of a constant?',
    options: ['1', 'The constant itself', '0', 'Undefined'],
    correctIndex: 2,
    explanation: 'Constants don\'t change, so their rate of change is zero.',
  },
  {
    question: 'If f(x) = 2x + 5, what is f\'(x)?',
    options: ['2x', '5', '2', '2x + 5'],
    correctIndex: 2,
    explanation: 'The derivative of 2x is 2 and the derivative of the constant 5 is 0, so f\'(x) = 2.',
  },
];

// POST /api/ai/quiz-generate — Generate quiz questions from transcript
aiRouter.post('/quiz-generate', async (req, res) => {
  const { transcript, topic, questionCount } = req.body;
  const count = Math.min(questionCount ?? 5, 10);

  try {
    const prompt = `Generate ${count} multiple-choice trivia questions for a college lecture review quiz.
${topic ? `Topic: ${topic}` : ''}
${transcript ? `Based on this transcript excerpt:\n"${transcript.slice(0, 1500)}"` : 'Generate general knowledge questions about calculus/derivatives.'}

Return ONLY valid JSON with this exact structure, no other text:
{"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..."}]}

Rules:
- Each question has exactly 4 options
- correctIndex is 0-based (0-3)
- Questions should test understanding, not just recall
- Explanations should be brief (1-2 sentences)
- Questions should increase in difficulty
- Return ONLY the JSON object, nothing else`;

    const completion = await openai.chat.completions.create({
      model: 'claude-sonnet-4.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    const parsed = extractJSON(content);
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid quiz format from AI');
    }

    res.json({ questions: parsed.questions });
  } catch (err) {
    console.error('[ai] quiz-generate error:', err);
    const shuffled = [...FALLBACK_QUIZ].sort(() => Math.random() - 0.5);
    res.json({ questions: shuffled.slice(0, count), fallback: true });
  }
});

// POST /api/ai/recovery-pack — Generate recovery pack from bookmarks
aiRouter.post('/recovery-pack', async (_req, res) => {
  // TODO: Implement with AI integration
  res.json({ items: [], message: 'AI service not yet implemented' });
});

// POST /api/ai/detect-cues — Detect professor importance cues
aiRouter.post('/detect-cues', async (_req, res) => {
  // TODO: Implement with AI integration
  res.json({ hasCue: false, message: 'AI service not yet implemented' });
});
