import express from 'express';
import { jobRouter } from './routes/job.routes.js';
import { schemeRouter } from './routes/scheme.routes.js';
import { testRouter } from './routes/test.routes.js';
import seoRouter from './routes/seo.routes.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import {
  corsMiddleware,
  helmetMiddleware,
  mongoSanitizeMiddleware,
  rateLimitMiddleware,
  suspiciousPayloadLogger
} from './middleware/security.js';
import { redirectMiddleware } from './middleware/redirect.js';
import { seoMiddleware } from './middleware/seo.js';

export const app = express();

app.set('trust proxy', 1);

// Security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);

// Redirect middleware (before body parsers)
app.use(redirectMiddleware);

// Body parsers
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(suspiciousPayloadLogger);
app.use(mongoSanitizeMiddleware);

// SEO middleware (after body parsers, before routes)
app.use(seoMiddleware);

app.get('/health', (_req, res) => {
  logger.info('GET /health check');
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// SEO routes (sitemap.xml, robots.txt, static pages)
app.use('/', seoRouter);

// API routes
app.use('/api', jobRouter);
app.use('/api', schemeRouter);

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
