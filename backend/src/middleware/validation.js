import { validationResult, matchedData } from 'express-validator';
import { logger } from '../utils/logger.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Invalid input blocked', {
      ip: req.ip,
      path: req.originalUrl,
      errors: errors.array({ onlyFirstError: true })
    });

    return res.status(400).json({
      message: 'Invalid request parameters'
    });
  }

  req.validated = matchedData(req, {
    includeOptionals: true,
    locations: ['params', 'query', 'body']
  });

  return next();
};
