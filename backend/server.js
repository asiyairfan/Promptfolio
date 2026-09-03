import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import extractRoute from './routes/extract.js';
import parseRoute from './routes/parse.js';
import publishRoute from './routes/publish.js';
import { getAiMode } from './services/ai.js';
import { deployProvider } from './services/deploy/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3003;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: [FRONTEND_ORIGIN, 'http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json({ limit: '2mb' }));
app.use('/p', express.static(path.join(__dirname, 'published')));

app.get('/api/ping', (_req, res) => {
  res.json({
    ok: true,
    ai: getAiMode(),
    deploy: deployProvider()
  });
});

app.use('/api/extract-text', extractRoute);
app.use('/api/parse-resume', parseRoute);
app.use('/api/publish', publishRoute);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'internal_error',
      message: err.message || 'Something went wrong.'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`AI mode: ${getAiMode()}, Deploy provider: ${deployProvider()}`);
});
