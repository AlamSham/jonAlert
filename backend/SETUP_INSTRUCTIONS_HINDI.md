# 🔧 Facebook Token Setup - Step by Step (Hindi)

## 📋 Tumhare Paas Kya Hai

✅ **META_PAGE_ID** = 1057501087452643 (Already set)
✅ **META_GRAPH_VERSION** = v25.0 (Already set)
❌ **META_PAGE_ACCESS_TOKEN** = EXPIRED (26-Apr-26 ko expire ho gaya)

## ❌ Kya Missing Hai

Tumhe sirf **2 cheezein** chahiye:

1. **META_APP_ID** - Facebook App ka ID
2. **META_APP_SECRET** - Facebook App ka Secret Key

---

## 🚀 Step-by-Step Setup (5 Minutes)

### Step 1: Facebook App ID aur Secret Lo

#### Option A: Agar Tumhare Paas Already App Hai

1. **Facebook Developer Console kholo:**
   ```
   https://developers.facebook.com/apps/
   ```

2. **Apna app select karo** (jaise "SarkariPulse" ya jo bhi naam hai)

3. **Settings → Basic pe jao**

4. **Copy karo:**
   - **App ID** (number hoga, jaise: 123456789012345)
   - **App Secret** (click "Show" button, phir copy karo)

#### Option B: Agar App Nahi Hai (Naya Banana Hai)

1. **Facebook Developer Console kholo:**
   ```
   https://developers.facebook.com/apps/
   ```

2. **"Create App" button pe click karo**

3. **"Business" type select karo** → Next

4. **App details bharo:**
   - App Name: "SarkariPulse" (ya koi bhi naam)
   - App Contact Email: tumhara email
   - Business Account: Select karo (ya skip karo)

5. **Create App pe click karo**

6. **Settings → Basic pe jao**

7. **Copy karo:**
   - **App ID**
   - **App Secret** (click "Show")

---

### Step 2: .env File Mein Add Karo

```bash
cd backend
nano .env
```

**Ye 2 lines add karo** (neeche META_PAGE_ID ke baad):

```bash
META_APP_ID=tumhara_app_id_yahan
META_APP_SECRET=tumhara_app_secret_yahan
```

**Example:**
```bash
META_GRAPH_VERSION=v25.0
META_PAGE_ID=1057501087452643
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456ghi789jkl012mno345pq
META_PAGE_ACCESS_TOKEN=EAAOA4B3FGbk...
```

**Save karo:** Ctrl+X → Y → Enter

---

### Step 3: Setup Script Run Karo

```bash
npm run setup:facebook-token
```

**Ye hoga:**

1. **Script start hoga:**
   ```
   🚀 Facebook Token Setup Script
   ==============================
   ```

2. **Environment check:**
   ```
   ✅ META_APP_ID: 123456789012345
   ✅ META_APP_SECRET: abc123def456...
   ✅ META_PAGE_ID: 1057501087452643
   ```

3. **Instructions dikhega:**
   ```
   📋 SETUP INSTRUCTIONS
   
   Go to Facebook Graph API Explorer:
   🔗 https://developers.facebook.com/tools/explorer/
   ```

4. **Graph API Explorer kholo** (new tab mein):
   - https://developers.facebook.com/tools/explorer/

5. **Apna app select karo** (top right dropdown)

6. **"Generate Access Token" button pe click karo**

7. **Permissions grant karo:**
   - ✅ pages_manage_posts
   - ✅ pages_read_engagement
   - ✅ pages_show_list

8. **Token copy karo** (text field se)
   - Ye short-lived token hai (1 hour)
   - Looks like: `EAAOA4B3FGbkBRfkkGol...`

9. **Script mein paste karo:**
   ```
   📝 Paste your SHORT-LIVED User Access Token here: [paste here]
   ```

10. **Enter press karo**

11. **Magic hoga! 🎉**
    ```
    🔄 Converting to never-expiring token...
    Step 1: Exchanging for long-lived user token...
    Step 2: Getting never-expiring page token...
    ✅ Token setup completed successfully! 🎉
    
    📄 Page Token:
       Page ID: 1057501087452643
       Page Name: SarkariPulse
       Expires: NEVER ✅
    ```

---

### Step 4: Verify Karo

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
   Needs Refresh: NO ✅
```

---

### Step 5: Test Karo

```bash
npm run test:facebook
```

**Expected:**
```
✅ Access token resolved successfully
✅ Page information retrieved
📝 Page Name: SarkariPulse
✅ Page permissions test passed
```

**Phir complete flow test karo:**
```bash
npm run test:job-flow:quick
```

**Expected:**
```
✅ Database connected
✅ Job created successfully
✅ Facebook post published
```

---

## 📝 Summary - Kya Chahiye

### Tumhare Paas Already Hai ✅
- META_PAGE_ID = 1057501087452643
- META_GRAPH_VERSION = v25.0
- MONGODB_URI (working)
- TELEGRAM credentials (working)

### Tumhe Sirf Ye Chahiye ❌
1. **META_APP_ID** - Facebook Developer Console se lo
2. **META_APP_SECRET** - Facebook Developer Console se lo

### Kahan Se Milega
- **Facebook Developer Console:** https://developers.facebook.com/apps/
- **Settings → Basic** section mein milega

---

## 🎯 Quick Commands

```bash
# 1. .env edit karo
nano backend/.env

# 2. Add karo:
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# 3. Setup run karo
npm run setup:facebook-token

# 4. Verify karo
npm run verify:token

# 5. Test karo
npm run test:facebook
npm run test:job-flow:quick
```

---

## ❓ Common Questions

**Q: App ID kahan milega?**
A: Facebook Developer Console → Your App → Settings → Basic

**Q: App Secret kahan hai?**
A: Same jagah, "Show" button pe click karo

**Q: Agar app nahi hai?**
A: "Create App" button se naya banao (5 minutes)

**Q: Permissions kaise grant karu?**
A: Graph API Explorer mein "Generate Access Token" pe click karo, checkboxes select karo

**Q: Token kitne din chalega?**
A: NEVER EXPIRES! Ek baar setup karo, forever chalega ✨

**Q: Phir se setup karna padega?**
A: Nahi! Automatic refresh hoga. Tumhe kuch nahi karna

---

## 🐛 Agar Problem Aaye

### "META_APP_ID is not set"
**Solution:** .env mein META_APP_ID add karo

### "Token validation failed"
**Solution:** 
1. Fresh token lo Graph API Explorer se
2. Sab permissions grant karo
3. Setup phir se run karo

### "Page not found"
**Solution:** Check karo META_PAGE_ID correct hai

### "No stored token found"
**Solution:** Setup script run karo: `npm run setup:facebook-token`

---

## ✅ Success Checklist

Setup complete hai jab:
- [ ] META_APP_ID aur META_APP_SECRET .env mein hai
- [ ] `npm run setup:facebook-token` successfully complete hua
- [ ] `npm run verify:token` shows "Never expires"
- [ ] `npm run test:facebook` pass ho gaya
- [ ] `npm run test:job-flow:quick` Facebook pe post kar raha hai

---

**Bas itna hi! App ID aur Secret add karo, setup script run karo, done! 🚀**

Koi problem ho to batao! 😊
