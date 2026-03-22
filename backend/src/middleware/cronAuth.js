import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const timingSafeEqual = (a, b) => {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const requireCronSecret = (req, res, next) => {
  if (!env.cronSecret) {
    logger.error('CRON_SECRET not configured — blocking cron trigger for safety');
    return res.status(503).json({ message: 'Cron endpoint not configured' });
  }

  const provided = req.header('x-cron-secret');
  if (timingSafeEqual(provided, env.cronSecret)) {
    return next();
  }

  logger.warn('Unauthorized cron trigger attempt', {
    ip: req.ip,
    path: req.originalUrl
  });

  return res.status(401).json({ message: 'Unauthorized' });
};
