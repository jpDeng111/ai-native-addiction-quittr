// Backend API server - Express + DeepSeek proxy
// Deploy to Vercel/Railway as a separate service

import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat';
import diaryRouter from './routes/diary';
import syncRouter from './routes/sync';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/chat', chatRouter);
app.use('/api/diary', diaryRouter);
app.use('/api/sync', syncRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;
