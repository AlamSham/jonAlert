# Google Indexing API Setup Guide

## Problem Solved
- **5000 jobs hai, sirf 250 indexed** - bahut slow!
- Google ko manually wait karna padta hai crawling ke liye
- Competition me peeche reh jaate hain

## Solution: Google Indexing API
Google ko **instantly notify** karo jab naya job post ho.
- ✅ **24-48 hours me indexed**
- ✅ **Automatic notifications** har naye job pe
- ✅ **Bulk push** purane 5000 jobs ke liye

---

## Setup Steps (5 minutes)

### Step 1: Enable Google Indexing API

1. Go to: https://console.cloud.google.com/apis/library/indexing.googleapis.com
2. Select your GCP project
3. Click **"Enable"**

### Step 2: Create Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **"Create Service Account"**
3. Name: `sarkaripulse-indexing`
4. Click **"Create and Continue"**
5. Skip role assignment (not needed)
6. Click **"Done"**

### Step 3: Create JSON Key

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **"JSON"**
5. Download the JSON file
6. Save it securely on your server (e.g., `/home/user/gcp-keys/indexing-key.json`)

### Step 4: Add Service Account to Search Console

1. Copy the service account email (looks like: `sarkaripulse-indexing@project-id.iam.gserviceaccount.com`)
2. Go to: https://search.google.com/search-console
3. Select your property (`sarkaripulse.net`)
4. Click **"Settings"** (left sidebar)
5. Click **"Users and permissions"**
6. Click **"Add user"**
7. Paste the service account email
8. Set permission to **"Owner"**
9. Click **"Add"**

### Step 5: Set Environment Variable

**On your server:**

```bash
# Add to .env file
echo 'GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/indexing-key.json' >> backend/.env
```

**Or export directly:**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/indexing-key.json"
```

### Step 6: Test the Integration

```bash
cd backend
node src/scripts/bulkIndexJobs.js
```

Expected output:
```
🚀 Starting bulk Google Indexing API notification...
✅ Credentials found
📡 Connecting to database...
✅ Database connected
📤 Fetching active jobs and notifying Google...
...
✅ Total jobs processed: 5000
✅ Successfully notified: 4998
❌ Failed notifications: 2
🎉 Google has been notified!
```

---

## How It Works

### Automatic Notifications (New Jobs)
When a new job is created, backend automatically notifies Google:

```javascript
// In job.service.js
await Job.create({ ... });  // Create job
notifyNewJob(saved);        // Notify Google instantly! ⚡
```

### Bulk Indexing (Existing Jobs)
Run the script once to push all 5000 existing jobs:

```bash
node src/scripts/bulkIndexJobs.js
```

---

## Monitoring & Troubleshooting

### Check if it's working:
1. Go to Google Search Console
2. Click **"URL Inspection"** (top bar)
3. Enter a newly published job URL
4. Should see: **"URL is on Google"** within 24-48 hours

### Common Issues:

**1. "GOOGLE_APPLICATION_CREDENTIALS not set"**
- Solution: Make sure you exported the env variable or added to .env

**2. "Permission denied" / 403 error**
- Solution: Add service account email to Search Console as Owner

**3. "Quota exceeded"**
- Solution: Google has rate limits (200 requests/day for new accounts, more for verified)
- Script handles this with delays between batches

### Rate Limits:
- **New accounts**: 200 URLs/day
- **Verified sites**: Higher limits (check your quota in GCP Console)
- Script processes in batches of 100 with 1-second delays

---

## Expected Results

### Timeline:
- **Day 1**: Run bulk script, notify Google of all 5000 jobs
- **Day 2-3**: Jobs start appearing in Google index
- **Week 1**: Majority of active jobs indexed
- **Ongoing**: New jobs auto-indexed within 24 hours

### Monitoring:
- Check Search Console → Coverage → Indexed pages
- Should see steady increase from 250 → 5000+

---

## Cost
**FREE!** Google Indexing API is free for verified sites.

---

## Support
If you face issues, check:
1. Service account has correct email format
2. JSON key file is valid
3. Service account is added to Search Console as Owner
4. API is enabled in GCP Console

Logs location: `backend/logs/` (check for Google Indexing API errors)
