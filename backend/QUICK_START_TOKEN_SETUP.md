# 🚀 Quick Start: Automatic Facebook Token Setup

## Problem Solved ✨

**Before:** Token expires → Manual refresh → Update .env → Redeploy backend → Repeat every 60 days 😫

**After:** One-time setup → Tokens auto-refresh forever → No more manual work! 🎉

---

## Setup in 5 Minutes

### Step 1: Add App Credentials

```bash
cd backend
nano .env
```

Add these two lines:
```bash
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
```

**Where to get these:**
1. Go to https://developers.facebook.com/apps/
2. Select your app (or create one)
3. Go to **Settings → Basic**
4. Copy **App ID** and **App Secret**

---

### Step 2: Run Setup Script

```bash
npm run setup:facebook-token
```

**Follow the prompts:**

1. **Get short-lived token:**
   - Go to https://developers.facebook.com/tools/explorer/
   - Select your app
   - Click "Generate Access Token"
   - Grant permissions: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`
   - Copy the token

2. **Paste token when prompted:**
   ```
   📝 Paste your SHORT-LIVED User Access Token here: [paste here]
   ```

3. **Wait for magic to happen:**
   ```
   🔄 Converting to never-expiring token...
   ✅ Token setup completed successfully! 🎉
   ```

---

### Step 3: Verify Setup

```bash
npm run verify:token
```

**Expected output:**
```
✅ Page token found in database
📊 Page Token Details:
   Expires: Never
   Needs Refresh: NO ✅
```

---

### Step 4: Test It

```bash
npm run test:facebook
npm run test:job-flow:quick
```

**Expected:**
- ✅ Facebook credentials validated
- ✅ Job posted to Facebook
- ✅ No errors

---

## Done! 🎉

Your tokens are now:
- ✅ Stored in database (not .env)
- ✅ Never expire
- ✅ Auto-refresh when needed
- ✅ No manual updates required

---

## What Happens Next?

### Automatic Management
- Backend checks tokens daily at 3 AM
- Refreshes if needed (7 days before expiry)
- Logs all refresh events
- No action needed from you!

### Optional Cleanup
You can now remove these from `.env` (optional):
```bash
# These are no longer needed (kept as fallback)
# META_PAGE_ACCESS_TOKEN=...
# META_USER_ACCESS_TOKEN=...
```

---

## Troubleshooting

### "META_APP_ID is not set"
**Solution:** Add `META_APP_ID` and `META_APP_SECRET` to `.env`

### "Token validation failed"
**Solution:** 
1. Get fresh token from Graph API Explorer
2. Make sure all permissions are granted
3. Run setup again

### "No stored token found"
**Solution:** Run `npm run setup:facebook-token`

---

## Commands Reference

```bash
# Setup (one-time)
npm run setup:facebook-token

# Verify status
npm run verify:token

# Test Facebook
npm run test:facebook

# Test complete flow
npm run test:job-flow:quick
```

---

## Need Help?

📖 **Full Documentation:** [AUTOMATIC_TOKEN_REFRESH.md](./AUTOMATIC_TOKEN_REFRESH.md)

📋 **Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)

🔧 **Scripts Reference:** [src/scripts/README.md](./src/scripts/README.md)

---

**That's it! Enjoy never worrying about expired tokens again! 🚀**
