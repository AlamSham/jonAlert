import express from 'express';
import { jobRouter } from './routes/job.routes.js';
import { testRouter } from './routes/test.routes.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import {
  corsMiddleware,
  helmetMiddleware,
  mongoSanitizeMiddleware,
  rateLimitMiddleware,
  suspiciousPayloadLogger
} from './middleware/security.js';

export const app = express();

app.set('trust proxy', 1);

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(suspiciousPayloadLogger);
app.use(mongoSanitizeMiddleware);

app.get('/health', (_req, res) => {
  logger.info('GET /health check');
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api', jobRouter);

if (env.nodeEnv !== 'production') {
  app.use('/api/test', testRouter);
  logger.info('Test routes enabled (non-production mode)');
}

app.use((err, _req, res, _next) => {
  logger.error('Unhandled API error', {
    message: err.message,
    stack: err.stack
  });

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.status(500).json({ message: 'Internal server error' });
});
