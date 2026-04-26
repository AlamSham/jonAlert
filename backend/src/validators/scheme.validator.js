import { param, query } from 'express-validator';

const validSchemeTypes = ['central', 'state'];

export const allSchemesValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt(),
  query('schemeType')
    .optional()
    .isIn(validSchemeTypes)
    .withMessage('Invalid schemeType'),
  query('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('page must be an integer between 1 and 1000')
    .toInt()
];

export const latestSchemesValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('limit must be an integer between 1 and 20')
    .toInt()
];

export const schemeSlugValidator = [
  param('slug')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format')
];

export const schemeTypeValidator = [
  param('type')
    .isIn(validSchemeTypes)
    .withMessage('Invalid scheme type'),
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

export const schemeStateValidator = [
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

export const searchSchemesValidator = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('q must be between 2 and 80 characters')
    .escape()
];
