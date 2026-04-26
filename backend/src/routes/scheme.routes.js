import { Router } from 'express';
import {
  getSchemes,
  getLatestSchemes,
  getSchemeBySlug,
  getSchemesByType,
  getSchemesByState,
  searchSchemes,
  getRelatedSchemes
} from '../controllers/scheme.controller.js';
import { catchAsync } from '../utils/catchAsync.js';
import { validateRequest } from '../middleware/validation.js';
import {
  allSchemesValidator,
  latestSchemesValidator,
  schemeSlugValidator,
  schemeTypeValidator,
  schemeStateValidator,
  searchSchemesValidator
} from '../validators/scheme.validator.js';

export const schemeRouter = Router();

// Set cache headers for GET requests
schemeRouter.use((req, res, next) => {
  if (req.method === 'GET') {
    // 60 seconds browser cache, 5 minutes CDN cache
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  }
  next();
});

// Public read endpoints
schemeRouter.get('/schemes', allSchemesValidator, validateRequest, catchAsync(getSchemes));
schemeRouter.get('/schemes/latest', latestSchemesValidator, validateRequest, catchAsync(getLatestSchemes));
schemeRouter.get('/schemes/search', searchSchemesValidator, validateRequest, catchAsync(searchSchemes));
schemeRouter.get('/schemes/type/:type', schemeTypeValidator, validateRequest, catchAsync(getSchemesByType));
schemeRouter.get('/schemes/state/:state', schemeStateValidator, validateRequest, catchAsync(getSchemesByState));
schemeRouter.get('/schemes/:slug', schemeSlugValidator, validateRequest, catchAsync(getSchemeBySlug));
schemeRouter.get('/schemes/:slug/related', catchAsync(getRelatedSchemes));
