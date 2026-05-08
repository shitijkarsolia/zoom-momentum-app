import WebSocket from 'ws';
import { config } from '../config.js';
import { getActiveHostMeetingId } from './websocket.js';

const BOT_NAMES = [
  'Liam Wirth', 'Advikaa Kapil', 'Shitij Mathur', 'Yash Sawant',
  'Neha Kashyap', 'Amanda Federico', 'Jesus Franco Yescas',
  'Sofia Rodriguez', 'Priya Mehta', 'Ethan Chen',
  'Zara Hassan', 'Marcus Davis', 'Yuki Sato',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

class BotStudent {
  private ws: WebSocket | null = null;
  private seq = 0;
  private skill: number;
  private quizAnswers: Map<number, number> = new Map();

  constructor(
    public readonly name: string,
    private meetingId: string,
  ) {
    // Skill ranges from 0.4 to 0.9 — determines probability of correct answer
    this.skill = 0.4 + Math.random() * 0.5;
  }

  connect() {
    const participantId = `bot-${this.name.toLowerCase().replace(/[^a-z]/g, '')}-${Date.now()}`;
    const url = `ws://localhost:${config.port}/ws?meetingId=${encodeURIComponent(this.meetingId)}&role=student&participantId=${participantId}`;

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.send('REQUEST_STATE', null);
    });

    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleMessage(msg);
      } catch { /* ignore malformed */ }
    });

    this.ws.on('error', () => { /* silent */ });
  }

  disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
  }

  private handleMessage(msg: { type: string; payload: any }) {
    // Learn correct answers from FULL_STATE (host sends quiz with correctIndex)
    if (msg.type === 'FULL_STATE' && msg.payload?.arena?.questions) {
      const questions = msg.payload.arena.questions as Array<{ correctIndex: number }>;
      questions.forEach((q, i) => {
        if (typeof q.correctIndex === 'number') {
          this.quizAnswers.set(i, q.correctIndex);
        }
      });
    }

    if (msg.type === 'POLL_START') {
      const { pollId, options } = msg.payload;
      const delay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        // Polls have no correct answer — cluster most bots on one option for realism
        const popularOption = Math.floor(Math.random() * options.length);
        const optionIndex = Math.random() < 0.65
          ? popularOption
          : Math.floor(Math.random() * options.length);
        this.send('POLL_RESPONSE', { pollId, optionIndex });
      }, delay);
    }

    if (msg.type === 'ARENA_QUESTION') {
      const { index: questionIndex, options } = msg.payload;
      const correctIndex = this.quizAnswers.get(questionIndex);
      // Skilled bots answer faster
      const delay = 800 + (1 - this.skill) * 3200 + Math.random() * 500;
      setTimeout(() => {
        let optionIndex: number;
        if (correctIndex !== undefined && Math.random() < this.skill) {
          // Answer correctly based on skill probability
          optionIndex = correctIndex;
        } else {
          // Pick a wrong answer randomly
          const wrongOptions = Array.from({ length: options.length }, (_, i) => i)
            .filter(i => i !== correctIndex);
          optionIndex = wrongOptions.length > 0
            ? wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
            : Math.floor(Math.random() * options.length);
        }
        this.send('ARENA_ANSWER', { optionIndex, questionIndex, name: this.name });
      }, delay);
    }
  }

  private send(type: string, payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      type,
      payload,
      seq: ++this.seq,
      timestamp: Date.now(),
      senderId: `bot-${this.name.toLowerCase().replace(/[^a-z]/g, '')}`,
      senderRole: 'student',
    }));
  }
}

class MockStudentManager {
  private bots: BotStudent[] = [];
  private meetingId: string | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];

  start(count: number = 8): { meetingId: string; botCount: number } {
    const meetingId = getActiveHostMeetingId();
    if (!meetingId) {
      throw new Error('No active host meeting found. Open the host side panel first.');
    }

    this.stop();
    this.meetingId = meetingId;

    const names = shuffle(BOT_NAMES).slice(0, Math.min(count, BOT_NAMES.length));
    const interval = 40000 / names.length;

    for (let i = 0; i < names.length; i++) {
      const delay = interval * i + Math.random() * 2000;
      const timer = setTimeout(() => {
        const bot = new BotStudent(names[i], meetingId);
        bot.connect();
        this.bots.push(bot);
        console.log(`[mock-students] ${names[i]} joined (${this.bots.length}/${names.length})`);
      }, delay);
      this.timers.push(timer);
    }

    return { meetingId, botCount: names.length };
  }

  stop() {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
    for (const bot of this.bots) bot.disconnect();
    const count = this.bots.length;
    this.bots = [];
    this.meetingId = null;
    if (count > 0) console.log(`[mock-students] Stopped ${count} bots`);
  }

  getStatus() {
    return {
      active: this.bots.length > 0,
      botCount: this.bots.length,
      meetingId: this.meetingId,
    };
  }
}

export const mockStudents = new MockStudentManager();
