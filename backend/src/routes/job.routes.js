import { Router } from 'express';
import {
  getJobs,
  getJobBySlug,
  getJobsByCategory,
  getJobsByState,
  getLatestJobs,
  searchJobs,
  getTrendingJobs,
  getStats,
  getSitemap,
  triggerCronNow
} from '../controllers/job.controller.js';
import { catchAsync } from '../utils/catchAsync.js';
import { validateRequest } from '../middleware/validation.js';
import { requireCronSecret } from '../middleware/cronAuth.js';
import {
  allJobsValidator,
  categoryJobsValidator,
  cronTriggerValidator,
  jobSlugValidator,
  latestJobsValidator,
  searchJobsValidator,
  stateJobsValidator,
  trendingJobsValidator
} from '../validators/job.validator.js';

export const jobRouter = Router();

// Public read endpoints
jobRouter.get('/jobs', allJobsValidator, validateRequest, catchAsync(getJobs));
jobRouter.get('/jobs/latest', latestJobsValidator, validateRequest, catchAsync(getLatestJobs));
jobRouter.get('/jobs/trending', trendingJobsValidator, validateRequest, catchAsync(getTrendingJobs));
jobRouter.get('/jobs/search', searchJobsValidator, validateRequest, catchAsync(searchJobs));
jobRouter.get('/jobs/category/:category', categoryJobsValidator, validateRequest, catchAsync(getJobsByCategory));
jobRouter.get('/jobs/state/:state', stateJobsValidator, validateRequest, catchAsync(getJobsByState));
jobRouter.get('/jobs/:slug', jobSlugValidator, validateRequest, catchAsync(getJobBySlug));

// Stats & SEO
jobRouter.get('/stats', catchAsync(getStats));
jobRouter.get('/sitemap.xml', catchAsync(getSitemap));

// Admin
jobRouter.post('/cron/run', requireCronSecret, cronTriggerValidator, validateRequest, catchAsync(triggerCronNow));
