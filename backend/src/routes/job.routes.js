import { Router } from 'express';
import {
  getJobs,
  getJobBySlug,
  getJobsByCategory,
  getJobsByState,
  getJobsByQualification,
  getJobsByOrg,
  getLatestJobs,
  searchJobs,
  getTrendingJobs,
  getStats,
  getSitemap,
  triggerCronNow,
  getRelatedJobs,
  getTodayJobs,
  getClosingSoonJobs
} from '../controllers/job.controller.js';
import { getRssFeed } from '../controllers/rss.controller.js';
import { subscribeNewsletter } from '../controllers/subscriber.controller.js';
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

// Set cache headers for GET requests to improve API performance and reduce bounce
jobRouter.use((req, res, next) => {
  if (req.method === 'GET') {
    // 60 seconds browser cache, 5 minutes CDN cache
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  }
  next();
});

// Public read endpoints
jobRouter.get('/jobs', allJobsValidator, validateRequest, catchAsync(getJobs));
jobRouter.get('/jobs/latest', latestJobsValidator, validateRequest, catchAsync(getLatestJobs));
jobRouter.get('/jobs/trending', trendingJobsValidator, validateRequest, catchAsync(getTrendingJobs));
jobRouter.get('/jobs/search', searchJobsValidator, validateRequest, catchAsync(searchJobs));
jobRouter.get('/jobs/category/:category', categoryJobsValidator, validateRequest, catchAsync(getJobsByCategory));
jobRouter.get('/jobs/state/:state', stateJobsValidator, validateRequest, catchAsync(getJobsByState));
jobRouter.get('/jobs/today', allJobsValidator, validateRequest, catchAsync(getTodayJobs));
jobRouter.get('/jobs/closing-soon', allJobsValidator, validateRequest, catchAsync(getClosingSoonJobs));
jobRouter.get('/jobs/qualification/:qualification', catchAsync(getJobsByQualification));
jobRouter.get('/jobs/org/:orgSlug', catchAsync(getJobsByOrg));
jobRouter.get('/jobs/:slug', jobSlugValidator, validateRequest, catchAsync(getJobBySlug));
jobRouter.get('/jobs/:slug/related', catchAsync(getRelatedJobs));

// Stats & SEO
jobRouter.get('/stats', catchAsync(getStats));
jobRouter.get('/sitemap.xml', catchAsync(getSitemap));
jobRouter.get('/rss.xml', catchAsync(getRssFeed));

// Newsletter
jobRouter.post('/subscribe', catchAsync(subscribeNewsletter));

// Admin
jobRouter.post('/cron/run', requireCronSecret, cronTriggerValidator, validateRequest, catchAsync(triggerCronNow));
