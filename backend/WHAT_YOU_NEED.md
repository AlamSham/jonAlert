# 📋 Kya Chahiye - Quick Reference

## ✅ Tumhare Paas Already Hai

```bash
META_PAGE_ID=1057501087452643          ✅ SET
META_GRAPH_VERSION=v25.0                ✅ SET
META_PAGE_ACCESS_TOKEN=EAAOA4B3FGbk... ❌ EXPIRED (26-Apr-26)
```

---

## ❌ Kya Missing Hai (Sirf 2 Cheezein!)

```bash
META_APP_ID=???                         ❌ MISSING
META_APP_SECRET=???                     ❌ MISSING
```

---

## 🔍 Kahan Se Milega

### Facebook Developer Console
🔗 **https://developers.facebook.com/apps/**

```
1. Login karo
2. Apna app select karo (ya naya banao)
3. Settings → Basic pe jao
4. Copy karo:
   - App ID (number)
   - App Secret (click "Show" button)
```

---

## 📝 .env File Mein Kya Add Karna Hai

**Current .env:**
```bash
META_GRAPH_VERSION=v25.0
META_PAGE_ID=1057501087452643
META_PAGE_ACCESS_TOKEN=EAAOA4B3FGbk...  # Ye purana hai, ignore karo
```

**Add karo (2 lines):**
```bash
META_GRAPH_VERSION=v25.0
META_PAGE_ID=1057501087452643
META_APP_ID=123456789012345              # ← YE ADD KARO
META_APP_SECRET=abc123def456ghi789       # ← YE ADD KARO
META_PAGE_ACCESS_TOKEN=EAAOA4B3FGbk...  # Ye purana, rehne do
```

---

## 🚀 Commands (Order Mein)

```bash
# 1. .env edit karo
nano backend/.env

# 2. Add karo META_APP_ID aur META_APP_SECRET

# 3. Save karo (Ctrl+X, Y, Enter)

# 4. Setup run karo
npm run setup:facebook-token

# 5. Graph API Explorer se token lo aur paste karo

# 6. Done! Verify karo
npm run verify:token
```

---

## 🎯 Expected Result

**After setup:**
```
✅ Page token found in database
📊 Page Token Details:
   Page ID: 1057501087452643
   Page Name: SarkariPulse
   Expires: Never ✨
   Needs Refresh: NO ✅
```

---

## 📸 Visual Guide

### Step 1: Facebook Developer Console
```
https://developers.facebook.com/apps/
    ↓
[Your App Name]
    ↓
Settings → Basic
    ↓
App ID: 123456789012345        ← COPY THIS
App Secret: [Show] → Copy      ← COPY THIS
```

### Step 2: Add to .env
```
nano backend/.env
    ↓
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456
    ↓
Save (Ctrl+X, Y, Enter)
```

### Step 3: Run Setup
```
npm run setup:facebook-token
    ↓
Go to Graph API Explorer
    ↓
Generate Access Token
    ↓
Paste token
    ↓
✅ Done!
```

---

## ⏱️ Time Required

- **Get App ID & Secret:** 2 minutes
- **Add to .env:** 30 seconds
- **Run setup script:** 2 minutes
- **Total:** ~5 minutes

---

## 🎁 What You Get

After setup:
- ✅ Never-expiring Facebook token
- ✅ Automatic token refresh (no manual work)
- ✅ Database storage (no .env updates needed)
- ✅ Zero downtime
- ✅ Automatic monitoring

---

## 📞 Need Help?

**Full Guide:** `SETUP_INSTRUCTIONS_HINDI.md`

**Quick Start:** `QUICK_START_TOKEN_SETUP.md`

**Technical Docs:** `AUTOMATIC_TOKEN_REFRESH.md`

---

**Bas 2 cheezein chahiye: APP_ID aur APP_SECRET! 🚀**
