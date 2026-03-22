import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { validateRequest } from '../middleware/validation.js';
import {
  aiTest,
  configStatusTest,
  pingTest,
  requiredKeysTest,
  telegramTest
} from '../controllers/test.controller.js';
import {
  aiTestValidator,
  requiredKeysValidator,
  telegramTestValidator
} from '../validators/test.validator.js';

export const testRouter = Router();

testRouter.get('/ping', catchAsync(pingTest));
testRouter.get('/config', catchAsync(configStatusTest));
testRouter.get('/keys', requiredKeysValidator, validateRequest, catchAsync(requiredKeysTest));
testRouter.post('/telegram', telegramTestValidator, validateRequest, catchAsync(telegramTest));
testRouter.post('/ai', aiTestValidator, validateRequest, catchAsync(aiTest));
