import { param, query } from 'express-validator';

const validCategories = ['job', 'result', 'admit-card', 'admission', 'scholarship', 'exam-form'];

export const latestJobsValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt()
];

export const allJobsValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt(),
  query('category')
    .optional()
    .isIn(validCategories)
    .withMessage('Invalid category'),
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('page must be an integer between 1 and 1000')
    .toInt()
];

export const categoryJobsValidator = [
  param('category')
    .isIn(validCategories)
    .withMessage('Invalid category'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt(),
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('page must be an integer between 1 and 1000')
    .toInt()
];

export const stateJobsValidator = [
  param('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt(),
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('page must be an integer between 1 and 1000')
    .toInt()
];

export const jobSlugValidator = [
  param('slug')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format')
];

export const searchJobsValidator = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('q must be between 2 and 80 characters')
    .escape()
];

export const trendingJobsValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be an integer between 1 and 50')
    .toInt()
];

export const cronTriggerValidator = [];
