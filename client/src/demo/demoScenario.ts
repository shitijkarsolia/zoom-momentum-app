import type { GlossaryEntry, Question, Topic } from '../types/messages';

export interface DemoStudentProfile {
  participantId: string;
  name: string;
  pollAnswerIndex: number;
  arenaAnswers: number[];
  arenaAnswerMs: number[];
}

export interface DemoTranscriptBeat {
  atMs: number;
  speaker: string;
  text: string;
}

export interface DemoTopic extends Topic {
  revealAtMs: number;
}

export interface DemoGlossaryEntry extends GlossaryEntry {
  revealAtMs: number;
}

export interface DemoPoll {
  question: string;
  options: string[];
}

export interface DemoRecoveryItem {
  topic: string;
  explanation: string;
  practice: string;
  resource: string;
}

export interface DemoScenario {
  meetingId: string;
  title: string;
  hostName: string;
  studentName: string;
  baseTimestamp: number;
  transcriptBeats: DemoTranscriptBeat[];
  topics: DemoTopic[];
  glossary: DemoGlossaryEntry[];
  poll: DemoPoll;
  questions: Question[];
  students: DemoStudentProfile[];
  recoveryItems: DemoRecoveryItem[];
  autoBookmarkCue: {
    topic: string;
    transcriptSnippet: string;
  };
}

const baseTimestamp = Date.UTC(2026, 0, 15, 18, 0, 0);

export const demoScenario: DemoScenario = {
  meetingId: 'public-demo-ai-lecture',
  title: 'Intro to AI Systems',
  hostName: 'Professor Rivera',
  studentName: 'Shitij Mathur',
  baseTimestamp,
  transcriptBeats: [
    {
      atMs: 0,
      speaker: 'Professor Rivera',
      text: 'Today we are going to build intuition for how an AI system turns examples into predictions.',
    },
    {
      atMs: 8_000,
      speaker: 'Professor Rivera',
      text: 'A neural network is a layered function. Each layer transforms the input using weights, bias values, and an activation.',
    },
    {
      atMs: 16_000,
      speaker: 'Professor Rivera',
      text: 'During training, the model compares its prediction to the correct answer with a loss function.',
    },
    {
      atMs: 26_000,
      speaker: 'Professor Rivera',
      text: 'Gradient descent adjusts the weights in the direction that reduces that loss over many examples.',
    },
    {
      atMs: 38_000,
      speaker: 'Professor Rivera',
      text: 'This will be important for the exam: a model can memorize training examples and still fail on new data.',
    },
    {
      atMs: 50_000,
      speaker: 'Professor Rivera',
      text: 'That failure mode is overfitting. We watch a validation set to catch it before deployment.',
    },
    {
      atMs: 64_000,
      speaker: 'Professor Rivera',
      text: 'The practical goal is not just accuracy. It is building a system that generalizes reliably outside the classroom examples.',
    },
  ],
  topics: [
    {
      id: 'topic-ai-predictions',
      title: 'How AI Systems Make Predictions',
      bullets: [
        'AI systems learn patterns from labeled examples.',
        'A prediction is the output of a learned function.',
        'Training changes the function so future outputs improve.',
      ],
      startTime: baseTimestamp + 8_000,
      revealAtMs: 8_000,
    },
    {
      id: 'topic-training-loop',
      title: 'The Training Loop',
      bullets: [
        'The model predicts, measures error, and updates weights.',
        'Loss functions turn mistakes into a numerical signal.',
        'Gradient descent repeats small improvements over many examples.',
      ],
      startTime: baseTimestamp + 16_000,
      revealAtMs: 16_000,
    },
    {
      id: 'topic-generalization',
      title: 'Generalization and Overfitting',
      bullets: [
        'A model can memorize training data without learning the underlying pattern.',
        'Validation data estimates performance on unseen examples.',
        'Reliable AI systems are judged by behavior after deployment.',
      ],
      startTime: baseTimestamp + 50_000,
      revealAtMs: 50_000,
    },
  ],
  glossary: [
    {
      term: 'Neural network',
      definition: 'A layered function that transforms inputs into predictions through learned weights.',
      timestamp: baseTimestamp + 8_000,
      revealAtMs: 8_000,
    },
    {
      term: 'Loss function',
      definition: 'A scoring rule that measures how wrong a model prediction is.',
      timestamp: baseTimestamp + 16_000,
      revealAtMs: 16_000,
    },
    {
      term: 'Gradient descent',
      definition: 'An optimization method that nudges model weights toward lower loss.',
      timestamp: baseTimestamp + 26_000,
      revealAtMs: 26_000,
    },
    {
      term: 'Overfitting',
      definition: 'When a model memorizes training examples and performs poorly on new data.',
      timestamp: baseTimestamp + 50_000,
      revealAtMs: 50_000,
    },
    {
      term: 'Validation set',
      definition: 'Held-out examples used to estimate whether a model generalizes.',
      timestamp: baseTimestamp + 50_000,
      revealAtMs: 50_000,
    },
  ],
  poll: {
    question: 'Which part of the AI training loop is still least clear?',
    options: [
      'How weights change',
      'What the loss function measures',
      'Why validation data matters',
      'I am following so far',
    ],
  },
  questions: [
    {
      question: 'What does a loss function tell us during training?',
      options: [
        'How wrong the model prediction was',
        'How many layers the model has',
        'Which user will run the model',
        'Whether the app is deployed',
      ],
      correctIndex: 0,
      explanation: 'The loss function converts prediction error into a number the training process can reduce.',
    },
    {
      question: 'Why do we use a validation set?',
      options: [
        'To make training run without a dataset',
        'To estimate performance on examples the model did not train on',
        'To store every model weight',
        'To replace the loss function',
      ],
      correctIndex: 1,
      explanation: 'Validation examples help reveal whether the model generalizes beyond the training set.',
    },
  ],
  students: [
    // Arena scoring is 1000 + floor((1 - timeMs / 5000) * 500) per correct answer.
    // Mock students top out around 2,300 so the person taking the tour can finish
    // first on the leaderboard by answering both questions correctly.
    { participantId: 'student-liam', name: 'Liam Wirth', pollAnswerIndex: 2, arenaAnswers: [0, 1], arenaAnswerMs: [2_600, 2_400] },
    { participantId: 'student-sofia', name: 'Sofia Rodriguez', pollAnswerIndex: 1, arenaAnswers: [0, 1], arenaAnswerMs: [2_700, 2_800] },
    { participantId: 'student-amanda', name: 'Amanda Federico', pollAnswerIndex: 3, arenaAnswers: [0, 1], arenaAnswerMs: [2_900, 2_900] },
    { participantId: 'student-neha', name: 'Neha Kashyap', pollAnswerIndex: 0, arenaAnswers: [1, 1], arenaAnswerMs: [2_400, 2_000] },
    { participantId: 'student-priya', name: 'Priya Mehta', pollAnswerIndex: 0, arenaAnswers: [3, 1], arenaAnswerMs: [2_900, 1_400] },
    { participantId: 'student-advikaa', name: 'Advikaa Kapil', pollAnswerIndex: 1, arenaAnswers: [0, 2], arenaAnswerMs: [2_800, 3_100] },
    { participantId: 'student-yash', name: 'Yash Sawant', pollAnswerIndex: 1, arenaAnswers: [0, 2], arenaAnswerMs: [2_100, 2_600] },
    { participantId: 'student-jesus', name: 'Jesus Franco Yescas', pollAnswerIndex: 2, arenaAnswers: [2, 1], arenaAnswerMs: [2_800, 1_700] },
  ],
  recoveryItems: [
    {
      topic: 'The Training Loop',
      explanation: 'Training is an iterative cycle: predict, measure loss, update weights, and repeat.',
      practice: 'In one sentence each, define prediction, loss, and update.',
      resource: 'Review the topic card on loss functions and gradient descent.',
    },
    {
      topic: 'Generalization and Overfitting',
      explanation: 'A useful model must work on new examples, not only the data it memorized during training.',
      practice: 'Explain why a high training score can still be misleading.',
      resource: 'Compare the Overfitting and Validation set glossary entries.',
    },
  ],
  autoBookmarkCue: {
    topic: 'Generalization and Overfitting',
    transcriptSnippet: 'This will be important for the exam: a model can memorize training examples and still fail on new data.',
  },
};
