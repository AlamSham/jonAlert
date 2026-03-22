import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const allowedOrigins = env.frontendUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn('Blocked by CORS policy', { origin });
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Cron-Secret']
});

export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit triggered', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method
    });

    return res.status(429).json({
      message: 'Too many requests, please try again later.'
    });
  }
});

export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('Potential NoSQL injection input sanitized', {
      ip: req.ip,
      path: req.originalUrl,
      key
    });
  }
});

export const suspiciousPayloadLogger = (req, _res, next) => {
  const payload = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  }).toLowerCase();

  const suspiciousPatterns = ['<script', 'javascript:', '$where', 'mongodb://'];
  const detected = suspiciousPatterns.some((pattern) => payload.includes(pattern));

  if (detected) {
    logger.warn('Suspicious payload pattern detected', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method
    });
  }

  next();
};
