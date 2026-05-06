import { Router } from 'express';
import { mockStudents } from '../services/mock-students.js';

export const demoRouter = Router();

demoRouter.post('/start-bots', (req, res) => {
  try {
    const count = req.body?.count ?? 8;
    const result = mockStudents.start(count);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

demoRouter.post('/stop-bots', (_req, res) => {
  mockStudents.stop();
  res.json({ ok: true });
});

demoRouter.get('/status', (_req, res) => {
  res.json(mockStudents.getStatus());
});
