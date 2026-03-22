import { body, query } from 'express-validator';

const validCategories = ['job', 'result', 'admit-card'];

export const telegramTestValidator = [
  body('message')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('message must be between 5 and 500 characters')
    .escape()
];

export const aiTestValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 180 })
    .withMessage('title must be between 5 and 180 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('description must be between 10 and 1000 characters')
    .escape(),
  body('category')
    .optional()
    .isIn(validCategories)
    .withMessage('category must be one of: job, result, admit-card')
];

export const requiredKeysValidator = [
  query('scope')
    .optional()
    .isIn(['all', 'ai', 'telegram'])
    .withMessage('scope must be one of: all, ai, telegram')
];
