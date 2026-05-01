# Testing Scripts Documentation

Complete testing suite for SarkariPulse job automation system.

## 🔄 NEW: Automatic Token Management

**No more manual token updates!** We now have automatic Facebook token refresh system.

📖 **See:** [AUTOMATIC_TOKEN_REFRESH.md](../AUTOMATIC_TOKEN_REFRESH.md) for complete guide.

### Quick Setup (5 minutes)
```bash
# 1. Add to .env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# 2. Run setup
npm run setup:facebook-token

# 3. Verify
npm run verify:token

# Done! Tokens auto-refresh forever ✨
```

---

## 📋 Available Scripts

### 1. **setupFacebookToken.js** - Automatic Token Setup (NEW!)
One-time setup to generate never-expiring Facebook page access token.

#### Usage
```bash
npm run setup:facebook-token
```

#### What It Does
1. ✅ Guides you through getting short-lived token
2. ✅ Converts to long-lived user token (60 days)
3. ✅ Gets never-expiring page token
4. ✅ Stores in database for automatic management
5. ✅ No more manual .env updates needed!

---

### 2. **verifyFacebookToken.js** - Token Status Check (NEW!)
Checks status of stored Facebook tokens.

#### Usage
```bash
npm run verify:token
```

#### What It Shows
- Token expiration dates
- Days until expiry
- Refresh count and history
- Whether refresh is needed
- Token validity via Facebook API

---

### 3. **testJobFlow.js** - Complete Job Flow Testing
Tests the entire job processing pipeline from scraping to Facebook posting.

#### Usage
```bash
# Basic test (5 random jobs)
node src/scripts/testJobFlow.js

# Test specific source
node src/scripts/testJobFlow.js --source "Central UPSC Jobs" --count 3

# Skip Facebook posting
node src/scripts/testJobFlow.js --skip-facebook

# Skip Telegram notifications
node src/scripts/testJobFlow.js --skip-telegram

# Force Facebook post even for duplicates
node src/scripts/testJobFlow.js --force-post --count 1

# Debug mode with verbose logging
node src/scripts/testJobFlow.js --debug

# Combine options
node src/scripts/testJobFlow.js --source "Bihar" --count 2 --debug
```

#### Options
- `--source <name>` - Test specific source (partial name match)
- `--count <number>` - Number of jobs to process (default: 5)
- `--skip-facebook` - Skip Facebook posting test
- `--skip-telegram` - Skip Telegram notification test
- `--force-post` - Force Facebook post even if duplicate
- `--debug` - Enable debug logging
- `--help` - Show help message

#### What It Tests
1. ✅ Database connection
2. ✅ Facebook credentials validation
3. ✅ Telegram credentials validation
4. ✅ Job source loading
5. ✅ RSS feed scraping
6. ✅ AI content processing
7. ✅ Database saving with duplicate detection
8. ✅ Facebook queue system
9. ✅ Telegram notifications
10. ✅ Complete flow integration

---

### 4. **debugFacebook.js** - Facebook Integration Debugging
Comprehensive Facebook API testing and debugging tool.

#### Usage
```bash
# Run all tests
node src/scripts/debugFacebook.js --all

# Test specific components
node src/scripts/debugFacebook.js --test-token
node src/scripts/debugFacebook.js --test-permissions
node src/scripts/debugFacebook.js --test-post
node src/scripts/debugFacebook.js --test-queue
node src/scripts/debugFacebook.js --check-page

# Verbose mode
node src/scripts/debugFacebook.js --all --verbose

# Combine tests
node src/scripts/debugFacebook.js --test-token --check-page --verbose
```

#### Options
- `--test-token` - Test access token resolution
- `--test-permissions` - Test page permissions
- `--test-post` - Test posting capability
- `--test-queue` - Test queue system
- `--check-page` - Check page information
- `--verbose` - Enable verbose logging
- `--all` - Run all tests
- `--help` - Show help message

#### What It Tests
1. ✅ Environment variables validation
2. ✅ Access token resolution (Page/User token)
3. ✅ Page information retrieval
4. ✅ Page permissions check
5. ✅ Post generation and formatting
6. ✅ Queue system functionality
7. ✅ Diagnostic information

---

## 🚀 Quick Start Guide

### First Time Setup
1. Make sure your `.env` file is configured:
```bash
# Required for Facebook
META_PAGE_ID=your_page_id
META_PAGE_ACCESS_TOKEN=your_page_token
# OR
META_USER_ACCESS_TOKEN=your_user_token

# Required for Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Required for database
MONGODB_URI=your_mongodb_uri
```

2. Install dependencies:
```bash
cd backend
npm install
```

### Testing Workflow

#### Step 1: Debug Facebook Integration
```bash
# Check if Facebook is configured correctly
node src/scripts/debugFacebook.js --all --verbose
```

**Expected Output:**
- ✅ All environment variables present
- ✅ Access token resolved
- ✅ Page information retrieved
- ✅ Permissions validated

**If Failed:**
- Check META_PAGE_ID is correct
- Verify access token has not expired
- Ensure page permissions are granted

---

#### Step 2: Test Complete Job Flow
```bash
# Test with 1-2 jobs first
node src/scripts/testJobFlow.js --count 2 --debug
```

**Expected Output:**
- ✅ Database connected
- ✅ Jobs scraped from RSS feed
- ✅ AI processing completed
- ✅ Jobs saved to database
- ✅ Facebook posts queued
- ✅ Telegram notifications sent

**If Failed:**
- Check error messages in output
- Verify AI API keys (OpenAI/Gemini/Grok)
- Check network connectivity
- Review database connection

---

#### Step 3: Test Facebook Posting
```bash
# Test Facebook posting with force flag
node src/scripts/testJobFlow.js --count 1 --force-post
```

**Expected Output:**
- ✅ Facebook post created
- ✅ Post ID returned
- ✅ Post visible on Facebook page

**If Failed:**
- Run debugFacebook.js to check credentials
- Check Facebook page permissions
- Verify access token is not expired
- Check rate limits

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Facebook Post Not Appearing
**Symptoms:**
- Script says "queued" but no post on Facebook
- No error messages

**Solutions:**
```bash
# Check Facebook credentials
node src/scripts/debugFacebook.js --test-token --test-permissions

# Check queue status
node src/scripts/debugFacebook.js --test-queue

# Force a test post
node src/scripts/testJobFlow.js --count 1 --force-post --debug
```

**Possible Causes:**
- Access token expired
- Page permissions not granted
- Duplicate detection preventing post
- Queue system issue

---

#### 2. Access Token Issues
**Symptoms:**
- "Could not resolve Facebook Page access token"
- "META_PAGE_ACCESS_TOKEN or META_USER_ACCESS_TOKEN is required"

**Solutions:**
1. Check if tokens are set in `.env`:
```bash
echo $META_PAGE_ACCESS_TOKEN
echo $META_USER_ACCESS_TOKEN
```

2. Get new tokens:
   - **Page Access Token**: Facebook Graph API Explorer
   - **User Access Token**: Facebook Graph API Explorer with user permissions

3. Test token:
```bash
node src/scripts/debugFacebook.js --test-token --verbose
```

---

#### 3. Duplicate Jobs Not Posting
**Symptoms:**
- Jobs marked as "duplicate"
- Facebook shows "already published" or "not eligible"

**Solutions:**
```bash
# Force post for testing
node src/scripts/testJobFlow.js --force-post --count 1

# Check duplicate detection window
# Edit .env: FACEBOOK_RETRY_DUPLICATE_WINDOW_HOURS=24
```

**Explanation:**
- System prevents duplicate posts by default
- Use `--force-post` for testing only
- Adjust retry window in production

---

#### 4. AI Processing Failures
**Symptoms:**
- "AI processing failed"
- Jobs not being enhanced

**Solutions:**
1. Check AI API keys:
```bash
# In .env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GROK_API_KEY=xai-...
```

2. Test with different AI provider:
```bash
# Edit ai.service.js to use different provider
```

3. Check quota limits:
```bash
# Wait for cooldown period
# Or increase quota limits
```

---

## 📊 Understanding Output

### Success Indicators
```
✅ Database connected successfully
✅ Facebook credentials validated successfully
✅ Job created successfully: job-slug-here
✅ Facebook post published: 123456789_987654321
✅ Telegram notification sent successfully
```

### Warning Indicators
```
⚠️  Job is duplicate: existing-job-slug
⚠️  Facebook autopost already published, skipping queue
⚠️  No jobs found from this source
```

### Error Indicators
```
❌ Database connection failed
❌ Facebook credentials test failed
❌ Failed to process job: job-title
❌ Direct Facebook post failed
```

---

## 🎯 Testing Scenarios

### Scenario 1: Fresh Installation Test
```bash
# 1. Check environment
node src/scripts/debugFacebook.js --all

# 2. Test with 1 job
node src/scripts/testJobFlow.js --count 1 --debug

# 3. Verify Facebook post
# Check your Facebook page manually
```

---

### Scenario 2: Production Readiness Test
```bash
# 1. Test multiple sources
node src/scripts/testJobFlow.js --source "UPSC" --count 3
node src/scripts/testJobFlow.js --source "Bihar" --count 3
node src/scripts/testJobFlow.js --source "Railway" --count 3

# 2. Test queue system
node src/scripts/debugFacebook.js --test-queue

# 3. Monitor for 10 minutes
# Check Facebook page for posts
# Check Telegram for notifications
```

---

### Scenario 3: Debugging Failed Posts
```bash
# 1. Check credentials
node src/scripts/debugFacebook.js --test-token --test-permissions --verbose

# 2. Check page info
node src/scripts/debugFacebook.js --check-page --verbose

# 3. Test post generation
node src/scripts/debugFacebook.js --test-post --verbose

# 4. Force a test post
node src/scripts/testJobFlow.js --count 1 --force-post --debug
```

---

## 📝 Log Files

Scripts output to console. To save logs:

```bash
# Save complete log
node src/scripts/testJobFlow.js --debug > test-log.txt 2>&1

# Save only errors
node src/scripts/testJobFlow.js 2> error-log.txt

# Save with timestamp
node src/scripts/testJobFlow.js --debug | tee "test-$(date +%Y%m%d-%H%M%S).log"
```

---

## 🔧 Advanced Usage

### Custom Source Testing
```bash
# Test specific state
node src/scripts/testJobFlow.js --source "Jharkhand" --count 5

# Test central jobs
node src/scripts/testJobFlow.js --source "Central" --count 10

# Test results
node src/scripts/testJobFlow.js --source "Result" --count 3
```

### Batch Testing
```bash
# Create a test script
cat > test-all-sources.sh << 'EOF'
#!/bin/bash
for source in "UPSC" "SSC" "Railway" "Banking" "Bihar" "UP"; do
  echo "Testing source: $source"
  node src/scripts/testJobFlow.js --source "$source" --count 2
  sleep 10
done
EOF

chmod +x test-all-sources.sh
./test-all-sources.sh
```

---

## 🎓 Best Practices

1. **Always test with small counts first** (`--count 1` or `--count 2`)
2. **Use `--debug` flag when troubleshooting**
3. **Check Facebook page manually after tests**
4. **Monitor rate limits** (Facebook has posting limits)
5. **Use `--skip-facebook` during development** to avoid spam
6. **Keep access tokens secure** (never commit to git)
7. **Test in non-production environment first**
8. **Monitor logs for errors and warnings**

---

## 📞 Support

If issues persist:
1. Check all environment variables
2. Verify Facebook page permissions
3. Test with minimal configuration
4. Review error logs carefully
5. Check Facebook API status page

---

## 🔄 Regular Maintenance

### Weekly Checks
```bash
# Test Facebook integration
node src/scripts/debugFacebook.js --all

# Test job flow
node src/scripts/testJobFlow.js --count 3
```

### Monthly Checks
```bash
# Full system test
node src/scripts/testJobFlow.js --count 10 --debug

# Verify all sources
# Test different categories
# Check posting consistency
```

---

## 📈 Monitoring Metrics

Track these metrics:
- ✅ Jobs scraped per run
- ✅ Jobs created vs duplicates
- ✅ Facebook posts queued
- ✅ Facebook posts published
- ✅ Telegram notifications sent
- ✅ AI processing success rate
- ✅ Average processing time

---

**Happy Testing! 🚀**