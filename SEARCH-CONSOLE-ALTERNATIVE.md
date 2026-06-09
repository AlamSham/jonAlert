# Alternative: IAM Permission Method for Google Indexing API

## Problem
Search Console shows: "Failed to add user: email not found"

## Why This Happens
Service accounts need special verification in Search Console.

## Solution: Use IAM-based Permission (No Search Console needed!)

### Option 1: IAM Role Assignment

Google Indexing API can work WITHOUT Search Console ownership if:
- Your GCP project owns the domain
- Service account has proper IAM roles

**Try this script first - it might just work!**

```bash
cd backend
node src/scripts/bulkIndexJobs.js
```

If you get **403 Permission Denied**, then follow Option 2.

---

### Option 2: Domain Verification via DNS

1. **Go to Google Search Console:**
   https://search.google.com/search-console/welcome

2. **Add Domain Property:**
   - Select **"Domain"** (not URL prefix)
   - Enter: `sarkaripulse.net`
   - Click CONTINUE

3. **Verify via DNS:**
   - Copy the TXT record
   - Add to your domain DNS:
     ```
     Name: @
     Type: TXT
     Value: google-site-verification=xxxxx
     ```
   - Click VERIFY

4. **Add Service Account:**
   - Now add service account email as Owner
   - Should work!

---

### Option 3: Use Existing Owner Account

**Simplest workaround:**

Your personal account (`shamshadalamansari2@gmail.com`) is already Owner!

The API will work if:
- Site is verified under your account ✅
- API calls are made with valid credentials ✅

**No need to add service account to Search Console!**

Just run the script and it should work!

---

## Test Now

```bash
cd backend
node src/scripts/bulkIndexJobs.js
```

Look for:
- ✅ Success: URLs notified
- ❌ 403 Error: Need domain verification

Let me know what happens!
