# 📘 Facebook Posting Flow - Complete Summary

## 🎯 Overview

Complete documentation of how jobs are scraped, processed, saved to database, and posted to Facebook.

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     JOB AUTOMATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. CRON TRIGGER (Every 10 minutes)
   └─> src/cron/job.cron.js
       └─> Loads job sources from jobSources.india-aggressive.json

2. JOB SCRAPING
   └─> jobSourceService.scrapeJobsFromSource()
       ├─> Fetches RSS feed
       ├─> Parses XML
       └─> Extracts job data
           ├─> title
           ├─> sourceUrl
           ├─> publishedAt
           ├─> category
           └─> sourceName

3. AI PROCESSING
   └─> rewriteJobWithAi()
       ├─> Sends to OpenAI/Gemini/Grok
       ├─> Enhances content
       └─> Returns:
           ├─> rewrittenTitle
           ├─> summary
           ├─> content
           ├─> eligibility
           ├─> importantDates
           ├─> organization
           ├─> state
           ├─> vacancyCount
           ├─> lastDate
           ├─> qualificationLevel
           ├─> metaTitle
           ├─> metaDescription
           └─> tags

4. DUPLICATE DETECTION
   └─> processAndSaveJob()
       ├─> Check by sourceId
       ├─> Check by sourceUrl
       └─> Check by contentFingerprint
           └─> If duplicate:
               ├─> Return existing job
               └─> Retry Facebook post if eligible

5. DATABASE SAVING
   └─> Job.create()
       ├─> Generate unique slug
       ├─> Save to MongoDB
       └─> Return saved job

6. TELEGRAM NOTIFICATION
   └─> sendTelegramMessage()
       ├─> Build message
       └─> Send to Telegram bot

7. FACEBOOK POSTING
   └─> enqueueFacebookJobPost()
       ├─> Check if autopost enabled
       ├─> Check if already posted
       ├─> Add to queue
       └─> Process queue:
           ├─> Resolve access token
           ├─> Build message
           ├─> Build URL
           ├─> Post to Facebook
           └─> Update job with postId

8. COMPLETION
   └─> Job visible on:
       ├─> Website (sarkaripulse.net)
       ├─> Facebook page
       └─> Telegram channel
```

---

## 📂 File Structure

```
backend/
├── src/
│   ├── cron/
│   │   └── job.cron.js              # Cron job scheduler
│   ├── services/
│   │   ├── jobSource.service.js     # RSS scraping
│   │   ├── ai.service.js            # AI processing
│   │   ├── job.service.js           # Job processing & saving
│   │   ├── facebook.service.js      # Facebook posting
│   │   └── telegram.service.js      # Telegram notifications
│   ├── models/
│   │   └── Job.js                   # MongoDB schema
│   ├── data/
│   │   └── jobSources.india-aggressive.json  # RSS sources
│   └── scripts/
│       ├── testJobFlow.js           # Complete flow testing
│       ├── debugFacebook.js         # Facebook debugging
│       └── README.md                # Scripts documentation
├── .env                             # Environment variables
├── TESTING_GUIDE.md                 # Testing guide
└── FACEBOOK_FLOW_SUMMARY.md         # This file
```

---

## 🔑 Environment Variables

### Required for Facebook
```bash
# Facebook Page ID
META_PAGE_ID=1057501087452643

# Option 1: Page Access Token (Recommended)
META_PAGE_ACCESS_TOKEN=EAAOA4B3FGbkBRfkkGol...

# Option 2: User Access Token (Alternative)
META_USER_ACCESS_TOKEN=your_user_token

# Facebook API Version
META_GRAPH_VERSION=v25.0

# Enable/Disable autopost
FACEBOOK_AUTOPOST_ENABLED=true

# Posting delays and retries
FACEBOOK_POST_DELAY_MS=10000
FACEBOOK_POST_RETRY_DELAY_MS=30000
FACEBOOK_POST_MAX_RETRIES=3
FACEBOOK_REQUEST_TIMEOUT_MS=15000
FACEBOOK_RETRY_DUPLICATE_WINDOW_HOURS=24
```

### Required for Telegram
```bash
TELEGRAM_BOT_TOKEN=8229995086:AAGe0drOSZ8w1Sn9YUIRzPc8x2mL3ouul1A
TELEGRAM_CHAT_ID=1913550038
```

### Required for Database
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/job_alert
```

### Required for AI
```bash
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
GROK_API_KEY=xai-...
AI_ENABLED=true
```

---

## 🔍 Facebook Service Details

### 1. Access Token Resolution
```javascript
// src/services/facebook.service.js

export const resolveFacebookPageAccessToken = async () => {
  // If PAGE_ACCESS_TOKEN is set, use it directly
  if (resolvedPageAccessToken) return resolvedPageAccessToken;

  // Otherwise, resolve from USER_ACCESS_TOKEN
  // Fetches all pages user manages
  // Finds matching page by PAGE_ID
  // Returns page access token
}
```

### 2. Post Message Generation
```javascript
export const buildFacebookJobPostMessage = (job) => {
  // Generates formatted message:
  // - Category label (Sarkari Naukri, Result, etc.)
  // - Job title
  // - Summary (truncated to 240 chars)
  // - Organization
  // - State
  // - Vacancy count
  // - Last date
  // - Call to action
  // - Hashtags
}
```

### 3. Post URL Generation
```javascript
export const buildFacebookJobUrl = (job) => {
  // Generates job URL:
  // https://sarkaripulse.net/job/{slug}
}
```

### 4. Queue System
```javascript
export const enqueueFacebookJobPost = (job) => {
  // Checks:
  // 1. Is autopost enabled?
  // 2. Is Facebook configured?
  // 3. Is job valid?
  // 4. Already posted?
  // 5. Already queued?
  
  // If all checks pass:
  // - Add to queue
  // - Mark as queued in database
  // - Start queue processing
}
```

### 5. Queue Processing
```javascript
const processQueue = async () => {
  // For each job in queue:
  // 1. Wait for delay (10 seconds)
  // 2. Resolve access token
  // 3. Build message and URL
  // 4. Post to Facebook
  // 5. Update database with post ID
  // 6. Handle retries on failure
  // 7. Remove from queue
}
```

---

## 🎯 Duplicate Detection Logic

### Three-Level Check
```javascript
// Level 1: Source ID
const existsBySource = await Job.findOne({ sourceId: rawJob.sourceId });

// Level 2: Source URL
const existsByUrl = await Job.findOne({ sourceUrl: normalizedSourceUrl });

// Level 3: Content Fingerprint
const contentFingerprint = makeContentFingerprint(rawJob, aiData);
const existsByFingerprint = await Job.findOne({ contentFingerprint });
```

### Content Fingerprint
```javascript
const makeContentFingerprint = (rawJob, aiData) => {
  // Combines:
  // - Title (cleaned)
  // - Category (cleaned)
  // - Source URL (normalized)
  // - Summary (first 220 chars, cleaned)
  
  // Returns SHA1 hash
}
```

### Retry Logic for Duplicates
```javascript
const shouldRetryDuplicateFacebookPost = (job) => {
  // Retry if:
  // 1. Job not posted to Facebook yet
  // 2. Within retry window (24 hours by default)
  
  // This handles cases where:
  // - Previous post failed
  // - Duplicate found but not posted
}
```

---

## 📊 Database Schema

```javascript
// src/models/Job.js

const jobSchema = new mongoose.Schema({
  // Basic Info
  title: String,
  slug: String (unique),
  content: String,
  summary: String,
  
  // Classification
  category: String,
  state: String,
  organization: String,
  
  // Details
  vacancyCount: Number,
  lastDate: Date,
  qualificationLevel: String,
  eligibility: String,
  importantDates: String,
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  tags: [String],
  
  // Source Tracking
  sourceId: String (unique),
  sourceUrl: String (unique),
  sourceName: String,
  contentFingerprint: String (unique),
  publishedAt: Date,
  
  // Facebook Tracking
  facebookPostId: String,
  facebookPostedAt: Date,
  facebookPostQueuedAt: Date,
  facebookPostLastAttemptAt: Date,
  facebookPostLastError: String,
  facebookPostAttempts: Number,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
});
```

---

## 🚀 Testing Commands

### Quick Tests
```bash
# Test Facebook integration
npm run test:facebook

# Test job flow (2 jobs)
npm run test:job-flow:quick

# Test job flow (5 jobs)
npm run test:job-flow

# Debug mode
npm run test:job-flow:debug
```

### Detailed Tests
```bash
# Test specific source
node src/scripts/testJobFlow.js --source "UPSC" --count 3

# Test without Facebook
node src/scripts/testJobFlow.js --skip-facebook

# Force Facebook post
node src/scripts/testJobFlow.js --force-post --count 1

# Debug Facebook
node src/scripts/debugFacebook.js --all --verbose
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Posts Not Appearing on Facebook

**Possible Causes:**
1. Access token expired
2. Page permissions not granted
3. Duplicate detection preventing post
4. Queue system issue
5. Rate limiting

**Debug Steps:**
```bash
# 1. Check credentials
npm run debug:facebook -- --test-token

# 2. Check permissions
npm run debug:facebook -- --test-permissions

# 3. Check queue
npm run debug:facebook -- --test-queue

# 4. Force a test post
node src/scripts/testJobFlow.js --count 1 --force-post --debug
```

---

### Issue 2: "Could not resolve Facebook Page access token"

**Solution:**
1. Check `.env` file has either:
   - `META_PAGE_ACCESS_TOKEN` OR
   - `META_USER_ACCESS_TOKEN`

2. Get new token from Facebook Graph API Explorer

3. Test token:
```bash
npm run debug:facebook -- --test-token --verbose
```

---

### Issue 3: Duplicate Jobs Not Posting

**Explanation:**
- System prevents duplicate posts by default
- Duplicates detected by: sourceId, sourceUrl, contentFingerprint

**Solution for Testing:**
```bash
# Force post for testing
node src/scripts/testJobFlow.js --force-post --count 1
```

**Solution for Production:**
- Adjust retry window in `.env`:
```bash
FACEBOOK_RETRY_DUPLICATE_WINDOW_HOURS=24
```

---

## 📈 Monitoring & Metrics

### Key Metrics to Track
1. **Jobs Scraped** - Total jobs from RSS feeds
2. **Jobs Created** - New jobs saved to database
3. **Duplicates Detected** - Jobs skipped as duplicates
4. **Facebook Posts Queued** - Jobs added to Facebook queue
5. **Facebook Posts Published** - Successful Facebook posts
6. **Facebook Post Failures** - Failed Facebook posts
7. **Telegram Notifications** - Successful Telegram messages

### Database Queries
```javascript
// Total jobs
await Job.countDocuments();

// Jobs posted to Facebook
await Job.countDocuments({ facebookPostId: { $exists: true } });

// Jobs pending Facebook post
await Job.countDocuments({ 
  facebookPostId: { $exists: false },
  facebookPostQueuedAt: { $exists: true }
});

// Recent jobs
await Job.find().sort({ createdAt: -1 }).limit(10);
```

---

## 🔄 Production Workflow

### 1. Cron Job Runs (Every 10 minutes)
```javascript
// src/cron/job.cron.js
cron.schedule('*/10 * * * *', async () => {
  // Load sources
  // Scrape jobs
  // Process each job
  // Save to database
  // Queue Facebook posts
  // Send Telegram notifications
});
```

### 2. Queue Processing (Automatic)
```javascript
// Runs automatically when jobs are queued
// Processes one job at a time
// Waits 10 seconds between posts
// Retries failed posts up to 3 times
// Updates database with results
```

### 3. Manual Trigger (On-demand)
```bash
# Run cron once manually
npm run cron:once

# Test specific source
node src/scripts/testJobFlow.js --source "UPSC" --count 5
```

---

## 🎓 Best Practices

### Development
1. Use `--skip-facebook` to avoid spam
2. Test with small counts first (`--count 1`)
3. Use `--debug` for detailed logs
4. Check Facebook page manually

### Testing
1. Test one source at a time
2. Verify posts on Facebook
3. Check Telegram notifications
4. Monitor database for duplicates

### Production
1. Monitor cron job logs
2. Check Facebook rate limits
3. Keep access tokens secure
4. Regular token refresh
5. Monitor error rates

---

## 📞 Support Resources

### Documentation
- `backend/src/scripts/README.md` - Scripts documentation
- `backend/TESTING_GUIDE.md` - Testing guide
- `backend/FACEBOOK_FLOW_SUMMARY.md` - This file

### Test Scripts
- `testJobFlow.js` - Complete flow testing
- `debugFacebook.js` - Facebook debugging

### Useful Commands
```bash
# Check environment
cat backend/.env | grep -E "META_|TELEGRAM_|MONGODB_"

# View logs
tail -f logs/app.log

# Check database
mongo "mongodb+srv://..." --eval "db.jobs.countDocuments()"

# Test Facebook
npm run test:facebook:verbose
```

---

## ✅ Success Checklist

Your setup is working correctly if:
- [x] `npm run test:facebook` passes all checks
- [x] `npm run test:job-flow:quick` creates jobs
- [x] Facebook posts appear on your page
- [x] Telegram notifications are received
- [x] Jobs are saved in database
- [x] Duplicates are detected correctly
- [x] No errors in logs
- [x] Cron job runs successfully
- [x] Queue processes automatically

---

**Complete Flow Working! 🎉**

For testing: See `TESTING_GUIDE.md`
For scripts: See `src/scripts/README.md`