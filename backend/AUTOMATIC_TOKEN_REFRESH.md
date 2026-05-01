# 🔄 Automatic Facebook Token Refresh System

## 🎯 Problem Solved

**Before:** Facebook access tokens expire every 60 days, requiring manual token refresh and backend redeployment.

**After:** Tokens are automatically managed, stored in database, and refreshed when needed. No more manual updates or deployments!

---

## ✨ Features

### 1. Never-Expiring Page Tokens
- Converts short-lived tokens (1 hour) → Long-lived user tokens (60 days) → Never-expiring page tokens
- Page tokens derived from long-lived user tokens never expire (as long as page exists)

### 2. Database Storage
- Tokens stored in MongoDB, not in `.env` file
- Automatic fallback to `.env` tokens if database tokens not available
- Tracks refresh history, expiration dates, and usage statistics

### 3. Automatic Refresh
- Daily cron job checks token expiration
- Automatically refreshes tokens 7 days before expiry
- No manual intervention required

### 4. Seamless Integration
- Existing code works without changes
- `resolveFacebookPageAccessToken()` automatically uses database tokens
- Graceful fallback to legacy `.env` tokens

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Add App Credentials to .env

```bash
cd backend
nano .env
```

Add these lines (get from Facebook Developer Console):
```bash
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
```

**Where to find these:**
1. Go to https://developers.facebook.com/apps/
2. Select your app
3. Go to Settings → Basic
4. Copy App ID and App Secret

### Step 2: Run Setup Script

```bash
npm run setup:facebook-token
```

**What it does:**
1. Connects to database
2. Checks environment variables
3. Guides you through getting a short-lived token
4. Converts it to never-expiring token
5. Stores in database
6. Shows success summary

### Step 3: Verify Setup

```bash
npm run verify:token
```

**Expected output:**
```
✅ Page token found in database
📊 Page Token Details:
   Page ID: 1057501087452643
   Page Name: SarkariPulse
   Expires: Never
   Long-Lived: Yes
   Needs Refresh: NO ✅
```

### Step 4: Test Integration

```bash
npm run test:facebook
npm run test:job-flow:quick
```

**Done! 🎉** Your tokens are now automatically managed.

---

## 📋 Detailed Setup Guide

### Prerequisites

1. **Facebook App** with these permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`

2. **Environment Variables** in `.env`:
   ```bash
   META_APP_ID=your_app_id
   META_APP_SECRET=your_app_secret
   META_PAGE_ID=your_page_id
   ```

3. **Admin Access** to the Facebook page you want to post to

### Getting Short-Lived Token

1. **Go to Graph API Explorer:**
   🔗 https://developers.facebook.com/tools/explorer/

2. **Select Your App:**
   - Click "Meta App" dropdown (top right)
   - Select your app (e.g., "SarkariPulse")

3. **Generate Token:**
   - Click "Generate Access Token" button
   - Grant permissions when prompted:
     - ✅ pages_manage_posts
     - ✅ pages_read_engagement
     - ✅ pages_show_list

4. **Copy Token:**
   - Copy the User Access Token from the text field
   - It will look like: `EAAOA4B3FGbkBRfkkGol...`
   - This is a SHORT-LIVED token (expires in 1 hour)

### Running Setup Script

```bash
npm run setup:facebook-token
```

**Interactive prompts:**

1. **Check existing token:**
   ```
   ⚠️  Found existing token in database!
   Do you want to replace it? (yes/no):
   ```
   - Type `yes` to replace
   - Type `no` to cancel

2. **Paste short-lived token:**
   ```
   📝 Paste your SHORT-LIVED User Access Token here:
   ```
   - Paste the token from Graph API Explorer
   - Press Enter

3. **Wait for conversion:**
   ```
   🔄 Converting to never-expiring token...
   Step 1: Exchanging for long-lived user token...
   Step 2: Getting never-expiring page token...
   ```

4. **Success!**
   ```
   ✅ Token setup completed successfully! 🎉
   
   📄 Page Token:
      Token: EAAOA4B3FGbkBRfkkGol...
      Page ID: 1057501087452643
      Page Name: SarkariPulse
      Expires: NEVER ✅
   ```

---

## 🔍 How It Works

### Token Conversion Flow

```
Short-Lived User Token (1 hour)
         ↓
   [Exchange API Call]
         ↓
Long-Lived User Token (60 days)
         ↓
   [Get Page Token API Call]
         ↓
Never-Expiring Page Token (∞)
         ↓
   [Store in Database]
```

### Database Schema

```javascript
{
  type: 'page',                    // 'page' or 'user'
  token: 'EAAOA4B3FGbk...',       // Access token
  expiresAt: null,                 // null = never expires
  isLongLived: true,               // true for long-lived tokens
  pageId: '1057501087452643',     // Facebook page ID
  pageName: 'SarkariPulse',       // Page name
  lastRefreshed: Date,             // Last refresh timestamp
  refreshCount: 5,                 // Number of refreshes
  metadata: {                      // Additional info
    category: 'Website'
  }
}
```

### Automatic Refresh Logic

```javascript
// Runs daily at 3 AM
1. Check if token exists in database
2. Check if token expires in < 7 days
3. If yes:
   a. Get long-lived user token from database
   b. Request new page token from Facebook
   c. Save new token to database
   d. Log success
4. If no:
   - Log "Token does not need refresh"
```

### Integration with Existing Code

```javascript
// Before (manual token from .env)
const token = env.metaPageAccessToken;

// After (automatic token management)
const token = await resolveFacebookPageAccessToken();
// ↓ Automatically tries:
// 1. Database token (never expires)
// 2. .env PAGE_ACCESS_TOKEN (fallback)
// 3. Resolve from USER_ACCESS_TOKEN (fallback)
```

---

## 🛠️ Available Commands

### Setup & Verification

```bash
# Initial setup (one-time)
npm run setup:facebook-token

# Verify token status
npm run verify:token

# Test Facebook integration
npm run test:facebook
npm run test:facebook:verbose

# Test complete job flow
npm run test:job-flow:quick
npm run test:job-flow
```

### Debugging

```bash
# Debug Facebook credentials
npm run debug:facebook -- --test-token

# Debug page permissions
npm run debug:facebook -- --test-permissions

# Debug with verbose output
npm run debug:facebook -- --all --verbose
```

---

## 📊 Monitoring & Maintenance

### Check Token Status

```bash
npm run verify:token
```

**Output shows:**
- Token expiration date
- Days until expiry
- Refresh count
- Last refresh date
- Whether refresh is needed

### View Logs

```bash
# Backend logs (includes token refresh)
tail -f logs/backend.log

# Search for token refresh events
grep "token refresh" logs/backend.log

# Check for errors
grep "ERROR" logs/backend.log | grep -i token
```

### Manual Token Refresh

If automatic refresh fails, you can manually refresh:

```bash
# Option 1: Run setup again
npm run setup:facebook-token

# Option 2: Update .env and restart
# (legacy method, not recommended)
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required for automatic token management
META_APP_ID=your_app_id              # Facebook App ID
META_APP_SECRET=your_app_secret      # Facebook App Secret
META_PAGE_ID=your_page_id            # Facebook Page ID

# Optional (legacy, for fallback)
META_PAGE_ACCESS_TOKEN=token         # Manual page token
META_USER_ACCESS_TOKEN=token         # Manual user token

# Cron schedule (optional)
TOKEN_REFRESH_CRON_SCHEDULE="0 3 * * *"  # Daily at 3 AM (default)
```

### Cron Schedule

Default: Daily at 3 AM

To change:
```bash
# .env
TOKEN_REFRESH_CRON_SCHEDULE="0 */6 * * *"  # Every 6 hours
TOKEN_REFRESH_CRON_SCHEDULE="0 0 * * 0"    # Weekly on Sunday
TOKEN_REFRESH_CRON_SCHEDULE="0 2 * * *"    # Daily at 2 AM
```

---

## 🐛 Troubleshooting

### Issue 1: "META_APP_ID is not set"

**Solution:**
```bash
# Add to .env
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
```

Get from: https://developers.facebook.com/apps/ → Your App → Settings → Basic

---

### Issue 2: "Token validation failed"

**Causes:**
- Token expired before setup completed
- Wrong permissions granted
- App not connected to page

**Solution:**
1. Get fresh token from Graph API Explorer
2. Make sure all permissions are granted
3. Verify you're admin of the page
4. Run setup again

---

### Issue 3: "No stored token found"

**Solution:**
```bash
# Run setup
npm run setup:facebook-token

# Or check if database is connected
npm run verify:token
```

---

### Issue 4: "Automatic refresh failed"

**Check logs:**
```bash
grep "token refresh" logs/backend.log
```

**Common causes:**
- User token expired (60 days)
- Page permissions revoked
- App credentials changed

**Solution:**
```bash
# Run setup again to get new tokens
npm run setup:facebook-token
```

---

## 🎓 Best Practices

### 1. Initial Setup
- ✅ Run setup script once during deployment
- ✅ Verify token status after setup
- ✅ Test Facebook posting before going live
- ✅ Keep App ID and Secret secure

### 2. Monitoring
- ✅ Check token status weekly: `npm run verify:token`
- ✅ Monitor backend logs for refresh events
- ✅ Set up alerts for token expiration (optional)

### 3. Security
- ✅ Never commit `.env` file to git
- ✅ Use environment variables in production
- ✅ Rotate App Secret periodically
- ✅ Limit app permissions to minimum required

### 4. Backup
- ✅ Keep App ID and Secret in secure location
- ✅ Document page admin access
- ✅ Have backup admin for Facebook page

---

## 📈 Migration from Manual Tokens

### If you're currently using manual tokens:

**Step 1: Backup current .env**
```bash
cp .env .env.backup
```

**Step 2: Add App credentials**
```bash
# Add to .env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
```

**Step 3: Run setup**
```bash
npm run setup:facebook-token
```

**Step 4: Verify**
```bash
npm run verify:token
npm run test:facebook
```

**Step 5: Clean up (optional)**
```bash
# Remove from .env (optional, kept as fallback)
# META_PAGE_ACCESS_TOKEN=...
# META_USER_ACCESS_TOKEN=...
```

**Step 6: Deploy**
```bash
# Restart backend to enable automatic refresh
npm run start
```

---

## 🔄 Token Lifecycle

### Timeline

```
Day 0:  Setup script runs
        ↓ Short-lived token (1 hour)
        ↓ Convert to long-lived user token (60 days)
        ↓ Get never-expiring page token
        ✅ Store in database

Day 1-52: Token works perfectly
          Cron checks daily: "No refresh needed"

Day 53: Cron detects: "Expires in 7 days"
        ↓ Automatic refresh triggered
        ↓ New page token generated
        ✅ Updated in database

Day 54-112: New token works perfectly

Day 113: Refresh again (if user token still valid)

Day 120: User token expires (60 days from last setup)
         ⚠️  Need to run setup again
```

### When to Run Setup Again

- ✅ **Never** - if page token never expires (ideal case)
- ⚠️  **Every 60 days** - if user token expires
- 🔴 **Immediately** - if permissions revoked or app changed

---

## 📞 Support

### Quick Checks

Before asking for help:
- [ ] Ran `npm run verify:token`
- [ ] Checked backend logs
- [ ] Verified App ID and Secret are correct
- [ ] Confirmed you're admin of the page
- [ ] Tested with `npm run test:facebook`

### Common Questions

**Q: Do I need to update .env anymore?**
A: No! Tokens are stored in database and auto-refreshed.

**Q: What if I change Facebook page?**
A: Update `META_PAGE_ID` in .env and run setup again.

**Q: Can I use multiple pages?**
A: Yes, but you need separate database entries. Contact support for multi-page setup.

**Q: What happens if database is down?**
A: System falls back to `.env` tokens automatically.

**Q: How do I disable automatic refresh?**
A: Remove token refresh cron from `server.js` (not recommended).

---

## 🎉 Success Checklist

Your setup is complete when:
- ✅ `npm run verify:token` shows "Never expires"
- ✅ `npm run test:facebook` passes all checks
- ✅ `npm run test:job-flow:quick` posts to Facebook
- ✅ Backend logs show "Token refresh cron job started"
- ✅ No manual token updates needed for 60+ days

---

**Congratulations! 🚀** You now have automatic Facebook token management!

No more expired tokens, no more manual updates, no more backend redeployments for token refresh.

**Just set it and forget it!** ✨
