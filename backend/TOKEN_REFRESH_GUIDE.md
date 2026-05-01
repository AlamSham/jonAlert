# 🔑 Facebook Access Token Refresh Guide

## ❌ Problem
```
Error validating access token: Session has expired
```

Your Facebook access token has expired and needs to be refreshed.

---

## ✅ Solution: Get New Access Token

### Method 1: Using Facebook Graph API Explorer (Recommended)

#### Step 1: Go to Graph API Explorer
🔗 https://developers.facebook.com/tools/explorer/

#### Step 2: Select Your App
1. Click on "Meta App" dropdown (top right)
2. Select your app: **"SarkariPulse"** or your app name

#### Step 3: Get Page Access Token
1. Click on "User or Page" dropdown
2. Select "Get Page Access Token"
3. Select your page: **"SarkariPulse"** or your page name
4. Grant permissions if asked:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`

#### Step 4: Copy Token
1. Copy the access token from the "Access Token" field
2. It will look like: `EAAOA4B3FGbkBRfkkGol...`

#### Step 5: Update .env File
```bash
cd backend
nano .env
```

Update this line:
```bash
META_PAGE_ACCESS_TOKEN=YOUR_NEW_TOKEN_HERE
```

Save and exit (Ctrl+X, then Y, then Enter)

#### Step 6: Test New Token
```bash
npm run test:facebook
```

---

### Method 2: Using Access Token Debugger

#### Step 1: Check Current Token
🔗 https://developers.facebook.com/tools/debug/accesstoken/

1. Paste your current token
2. Click "Debug"
3. Check expiration date

#### Step 2: Extend Token (if possible)
1. If token can be extended, click "Extend Access Token"
2. Copy new token
3. Update `.env` file

#### Step 3: Or Get New Token
If extension not available, use Method 1 above.

---

### Method 3: Using Long-Lived Token

#### Step 1: Get User Access Token
🔗 https://developers.facebook.com/tools/explorer/

1. Select your app
2. Click "Generate Access Token"
3. Grant permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
4. Copy the User Access Token

#### Step 2: Exchange for Long-Lived Token
```bash
curl -X GET "https://graph.facebook.com/v25.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

#### Step 3: Get Page Access Token
```bash
curl -X GET "https://graph.facebook.com/v25.0/me/accounts" \
  -d "access_token=YOUR_LONG_LIVED_USER_TOKEN"
```

Find your page in the response and copy its `access_token`.

#### Step 4: Update .env
```bash
META_PAGE_ACCESS_TOKEN=YOUR_NEW_PAGE_TOKEN
```

---

## 🔄 Alternative: Use User Access Token

Instead of Page Access Token, you can use User Access Token:

### Step 1: Get User Access Token
🔗 https://developers.facebook.com/tools/explorer/

1. Select your app
2. Click "Generate Access Token"
3. Grant all page permissions
4. Copy token

### Step 2: Update .env
```bash
# Comment out or remove PAGE_ACCESS_TOKEN
# META_PAGE_ACCESS_TOKEN=old_token

# Add USER_ACCESS_TOKEN
META_USER_ACCESS_TOKEN=YOUR_USER_TOKEN_HERE
```

### Step 3: Test
```bash
npm run test:facebook
```

The system will automatically resolve Page Access Token from User Access Token.

---

## 🎯 Quick Fix (Right Now)

### Option A: Get New Token (5 minutes)
```bash
# 1. Go to Graph API Explorer
open https://developers.facebook.com/tools/explorer/

# 2. Get Page Access Token (follow steps above)

# 3. Update .env
cd backend
nano .env
# Update META_PAGE_ACCESS_TOKEN=new_token

# 4. Test
npm run test:facebook
```

### Option B: Use Existing User Token
```bash
# If you have META_USER_ACCESS_TOKEN in .env
cd backend
nano .env

# Comment out PAGE_ACCESS_TOKEN
# META_PAGE_ACCESS_TOKEN=expired_token

# Uncomment or add USER_ACCESS_TOKEN
META_USER_ACCESS_TOKEN=your_user_token

# Test
npm run test:facebook
```

---

## 📊 Token Types Explained

### Page Access Token
- ✅ Directly posts to page
- ✅ Simpler to use
- ❌ Expires (usually 60 days)
- ❌ Needs manual refresh

### User Access Token
- ✅ Can be long-lived (60 days)
- ✅ Can access multiple pages
- ✅ System auto-resolves Page Token
- ❌ Requires user permissions

### Long-Lived Page Token
- ✅ Never expires (if page not deleted)
- ✅ Most reliable
- ❌ Harder to get
- ❌ Requires app secret

---

## 🔍 Verify Token Status

### Check Token Info
```bash
# Using curl
curl -X GET "https://graph.facebook.com/v25.0/debug_token" \
  -d "input_token=YOUR_TOKEN" \
  -d "access_token=YOUR_APP_TOKEN"
```

### Or Use Debugger
🔗 https://developers.facebook.com/tools/debug/accesstoken/

---

## ⚠️ Common Issues

### Issue 1: "Invalid OAuth access token"
**Solution:** Token is completely invalid, get new token

### Issue 2: "Session has expired"
**Solution:** Token expired, refresh token (this guide)

### Issue 3: "Insufficient permissions"
**Solution:** Grant required permissions when getting token

### Issue 4: "Page not found"
**Solution:** Check META_PAGE_ID is correct

---

## 🎓 Best Practices

1. **Use Long-Lived Tokens** - Less frequent refreshes
2. **Monitor Expiration** - Set reminders before expiry
3. **Keep Backup** - Save both Page and User tokens
4. **Test Regularly** - Run `npm run test:facebook` weekly
5. **Secure Storage** - Never commit tokens to git

---

## 📝 Current Status

Based on test output:
- ❌ **META_PAGE_ACCESS_TOKEN**: Expired (26-Apr-26)
- ⚠️  **META_USER_ACCESS_TOKEN**: Not set
- ✅ **META_PAGE_ID**: Configured (1057501087452643)
- ✅ **Autopost**: Enabled
- ✅ **Database**: Connected (2915 jobs)

**Action Required:** Get new access token using Method 1 above.

---

## 🚀 After Token Refresh

### Test Again
```bash
npm run test:facebook
```

**Expected Output:**
```
✅ Access token resolved successfully
✅ Page information retrieved
📝 Page Name: Your Page Name
✅ Page permissions test passed
✅ Post generation and formatting test passed
```

### Then Test Job Flow
```bash
npm run test:job-flow:quick
```

---

**Need Help?** 
- Check Facebook Developer Console
- Verify app permissions
- Ensure page admin access
- Review token debugger output