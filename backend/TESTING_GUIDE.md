# 🧪 SarkariPulse Testing Guide

Complete guide for testing job scraping, database saving, and Facebook posting flow.

## 🚀 Quick Start (5 Minutes)

### Step 1: Check Facebook Setup
```bash
npm run test:facebook
```

**Expected Output:**
```
✅ META_PAGE_ID: 1057501087452643
✅ META_PAGE_ACCESS_TOKEN: EAAOA4B3FGbkBRfkkGol...
✅ Access token resolved successfully
✅ Page information retrieved
📝 Page Name: Your Page Name
```

**If Failed:** Check your `.env` file for Facebook credentials.

---

### Step 2: Test Job Flow (Quick Test)
```bash
npm run test:job-flow:quick
```

**Expected Output:**
```
✅ Database connected successfully
✅ Loaded 100+ job sources
✅ Scraped 10+ jobs from source
✅ Job created successfully: job-slug-here
📘 Facebook: Queued
✅ Facebook post published: 123456789_987654321
```

**If Failed:** Check error messages and refer to troubleshooting section.

---

### Step 3: Verify on Facebook
1. Open your Facebook page
2. Check for new posts
3. Verify post content and link

---

## 📋 Available Test Commands

### Quick Tests
```bash
# Quick test (2 jobs)
npm run test:job-flow:quick

# Full test (5 jobs)
npm run test:job-flow

# Debug mode
npm run test:job-flow:debug
```

### Facebook Tests
```bash
# Test Facebook integration
npm run test:facebook

# Verbose Facebook test
npm run test:facebook:verbose

# Debug specific Facebook component
npm run debug:facebook -- --test-token
npm run debug:facebook -- --check-page
```

### Custom Tests
```bash
# Test specific source
node src/scripts/testJobFlow.js --source "UPSC" --count 3

# Test without Facebook
node src/scripts/testJobFlow.js --skip-facebook --count 5

# Force Facebook post
node src/scripts/testJobFlow.js --force-post --count 1

# Test specific state
node src/scripts/testJobFlow.js --source "Bihar" --count 2 --debug
```

---

## 🔍 What Gets Tested

### testJobFlow.js Tests:
1. ✅ **Database Connection** - MongoDB connectivity
2. ✅ **Facebook Credentials** - Access token validation
3. ✅ **Telegram Credentials** - Bot token validation
4. ✅ **Job Sources** - RSS feed configuration
5. ✅ **Job Scraping** - RSS feed parsing
6. ✅ **AI Processing** - Content enhancement with OpenAI/Gemini/Grok
7. ✅ **Duplicate Detection** - sourceId, sourceUrl, contentFingerprint
8. ✅ **Database Saving** - Job model validation and saving
9. ✅ **Facebook Queue** - Post queuing system
10. ✅ **Facebook Posting** - Actual post creation
11. ✅ **Telegram Notification** - Message sending

### debugFacebook.js Tests:
1. ✅ **Environment Variables** - All required vars present
2. ✅ **Access Token Resolution** - Page/User token
3. ✅ **Page Information** - Page details retrieval
4. ✅ **Page Permissions** - Read/Write permissions
5. ✅ **Post Generation** - Message formatting
6. ✅ **Queue System** - Queue processing

---

## 🎯 Testing Scenarios

### Scenario 1: First Time Setup
```bash
# 1. Check environment
cat backend/.env | grep -E "META_|TELEGRAM_|MONGODB_"

# 2. Test Facebook
npm run test:facebook:verbose

# 3. Test job flow
npm run test:job-flow:quick

# 4. Check Facebook page manually
```

---

### Scenario 2: Debug Facebook Issues
```bash
# 1. Check credentials
npm run debug:facebook -- --test-token --verbose

# 2. Check page permissions
npm run debug:facebook -- --test-permissions --verbose

# 3. Check page info
npm run debug:facebook -- --check-page --verbose

# 4. Test posting
node src/scripts/testJobFlow.js --count 1 --force-post --debug
```

---

### Scenario 3: Test Specific Source
```bash
# Test UPSC jobs
node src/scripts/testJobFlow.js --source "UPSC" --count 3 --debug

# Test Bihar jobs
node src/scripts/testJobFlow.js --source "Bihar" --count 2 --debug

# Test Railway jobs
node src/scripts/testJobFlow.js --source "Railway" --count 3 --debug

# Test Results
node src/scripts/testJobFlow.js --source "Result" --count 2 --debug
```

---

### Scenario 4: Production Readiness
```bash
# 1. Test multiple sources
for source in "UPSC" "SSC" "Railway" "Banking" "Bihar"; do
  echo "Testing: $source"
  node src/scripts/testJobFlow.js --source "$source" --count 2
  sleep 5
done

# 2. Check Facebook page
# Verify all posts appeared

# 3. Check Telegram
# Verify all notifications sent

# 4. Check database
# Verify all jobs saved
```

---

## 🐛 Troubleshooting

### Issue 1: Facebook Posts Not Appearing

**Symptoms:**
- Script says "queued" but no post on Facebook
- No error messages

**Debug Steps:**
```bash
# 1. Check credentials
npm run debug:facebook -- --test-token

# 2. Check page permissions
npm run debug:facebook -- --test-permissions

# 3. Check queue
npm run debug:facebook -- --test-queue

# 4. Force a test post
node src/scripts/testJobFlow.js --count 1 --force-post --debug
```

**Common Causes:**
- ❌ Access token expired → Get new token
- ❌ Page permissions not granted → Grant permissions
- ❌ Duplicate detection → Use `--force-post`
- ❌ Queue system issue → Check logs

---

### Issue 2: "Could not resolve Facebook Page access token"

**Debug Steps:**
```bash
# 1. Check .env file
cat backend/.env | grep META_

# 2. Verify tokens are set
echo "Page ID: $META_PAGE_ID"
echo "Page Token: ${META_PAGE_ACCESS_TOKEN:0:20}..."
echo "User Token: ${META_USER_ACCESS_TOKEN:0:20}..."

# 3. Test token resolution
npm run debug:facebook -- --test-token --verbose
```

**Solutions:**
1. **Get Page Access Token:**
   - Go to Facebook Graph API Explorer
   - Select your page
   - Get Page Access Token
   - Copy to `.env` as `META_PAGE_ACCESS_TOKEN`

2. **Get User Access Token:**
   - Go to Facebook Graph API Explorer
   - Get User Access Token with `pages_manage_posts` permission
   - Copy to `.env` as `META_USER_ACCESS_TOKEN`

---

### Issue 3: Jobs Not Being Scraped

**Debug Steps:**
```bash
# 1. Test with debug mode
node src/scripts/testJobFlow.js --count 1 --debug

# 2. Check specific source
node src/scripts/testJobFlow.js --source "UPSC" --count 1 --debug

# 3. Check job sources file
cat backend/src/data/jobSources.india-aggressive.json | jq '.[0:3]'
```

**Common Causes:**
- ❌ RSS feed down → Try different source
- ❌ Network issue → Check connectivity
- ❌ Source URL changed → Update job sources file

---

### Issue 4: AI Processing Failures

**Debug Steps:**
```bash
# 1. Check AI keys
cat backend/.env | grep -E "OPENAI_|GEMINI_|GROK_"

# 2. Check AI enabled
cat backend/.env | grep AI_ENABLED

# 3. Test with debug
node src/scripts/testJobFlow.js --count 1 --debug
```

**Solutions:**
- Check API keys are valid
- Check quota limits
- Wait for cooldown period
- Try different AI provider

---

## 📊 Understanding Output

### Success Flow
```
[2024-01-15T10:30:00.000Z] 🔌 Testing database connection...
[2024-01-15T10:30:01.000Z] ✅ Database connected successfully
[2024-01-15T10:30:01.000Z] 📊 Current jobs in database: 150

[2024-01-15T10:30:02.000Z] 🔑 Testing Facebook credentials...
[2024-01-15T10:30:03.000Z] ✅ Facebook credentials validated successfully

[2024-01-15T10:30:04.000Z] 📋 Loading job sources...
[2024-01-15T10:30:04.000Z] ✅ Loaded 100 job sources

[2024-01-15T10:30:05.000Z] 🕷️  Scraping jobs from: Central UPSC Jobs
[2024-01-15T10:30:08.000Z] ✅ Scraped 15 jobs from Central UPSC Jobs

[2024-01-15T10:30:10.000Z] 🔄 Processing job 1: UPSC Civil Services Exam 2024...
[2024-01-15T10:30:15.000Z] ✅ Job created successfully: upsc-civil-services-exam-2024
[2024-01-15T10:30:15.000Z] 📘 Facebook: Queued (queued)

[2024-01-15T10:30:20.000Z] ⏳ Waiting for Facebook post queue to complete...
[2024-01-15T10:30:30.000Z] ✅ Facebook post queue completed

[2024-01-15T10:30:31.000Z] 📊 SUMMARY REPORT
[2024-01-15T10:30:31.000Z] ✅ Jobs Created: 2
[2024-01-15T10:30:31.000Z] 📘 Facebook Posts Queued: 2
```

---

## 🎓 Best Practices

### Development
1. ✅ Use `--skip-facebook` to avoid spam during development
2. ✅ Test with `--count 1` or `--count 2` first
3. ✅ Use `--debug` flag for detailed logs
4. ✅ Check Facebook page manually after tests

### Testing
1. ✅ Test one source at a time
2. ✅ Verify posts on Facebook page
3. ✅ Check Telegram notifications
4. ✅ Monitor database for duplicates

### Production
1. ✅ Test in staging environment first
2. ✅ Monitor rate limits
3. ✅ Check logs regularly
4. ✅ Keep access tokens secure

---

## 📝 Logging

### Save Logs to File
```bash
# Save complete log
npm run test:job-flow:debug > test-log.txt 2>&1

# Save with timestamp
npm run test:job-flow:debug | tee "test-$(date +%Y%m%d-%H%M%S).log"

# Save only errors
npm run test:job-flow 2> error-log.txt
```

### View Logs
```bash
# View recent logs
tail -f test-log.txt

# Search for errors
grep "❌" test-log.txt

# Search for success
grep "✅" test-log.txt
```

---

## 🔄 Regular Testing Schedule

### Daily (Automated)
```bash
# Add to crontab
0 9 * * * cd /path/to/backend && npm run test:job-flow:quick >> logs/daily-test.log 2>&1
```

### Weekly (Manual)
```bash
# Full system test
npm run test:facebook:verbose
npm run test:job-flow:debug

# Check multiple sources
node src/scripts/testJobFlow.js --source "UPSC" --count 3
node src/scripts/testJobFlow.js --source "Bihar" --count 3
```

### Monthly (Manual)
```bash
# Comprehensive test
for source in "UPSC" "SSC" "Railway" "Banking" "Bihar" "UP" "Maharashtra"; do
  echo "Testing: $source"
  node src/scripts/testJobFlow.js --source "$source" --count 5 --debug
  sleep 10
done
```

---

## 📞 Support Checklist

Before asking for help, check:
- [ ] Environment variables are set correctly
- [ ] Facebook access token is valid
- [ ] Database connection works
- [ ] AI API keys are valid
- [ ] Network connectivity is good
- [ ] Ran debug scripts with `--verbose`
- [ ] Checked error logs
- [ ] Tested with minimal configuration

---

## 🎯 Success Criteria

Your setup is working correctly if:
- ✅ `npm run test:facebook` passes all checks
- ✅ `npm run test:job-flow:quick` creates jobs
- ✅ Facebook posts appear on your page
- ✅ Telegram notifications are received
- ✅ Jobs are saved in database
- ✅ Duplicates are detected correctly
- ✅ No errors in logs

---

**Happy Testing! 🚀**

For detailed documentation, see: `backend/src/scripts/README.md`