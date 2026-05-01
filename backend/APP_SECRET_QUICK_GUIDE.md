# 🎯 APP SECRET - Ultra Quick Guide

## 🔗 Direct Link

```
https://developers.facebook.com/apps/
```

---

## 📍 5 Simple Steps

### 1️⃣ Open Link
```
https://developers.facebook.com/apps/
```

### 2️⃣ Login
```
Facebook account se login karo
```

### 3️⃣ Select App
```
Apna app select karo (ya Create App)
```

### 4️⃣ Go to Settings
```
Left menu → Settings → Basic
```

### 5️⃣ Copy Values
```
App ID: [Copy button]
App Secret: [Show button] → Copy
```

---

## 🖼️ Visual Flow

```
Browser
   ↓
https://developers.facebook.com/apps/
   ↓
Login with Facebook
   ↓
My Apps List
   ↓
[Click Your App]
   ↓
Left Menu → Settings → Basic
   ↓
┌─────────────────────────────┐
│ App ID: 123456789012345     │ ← Copy This
├─────────────────────────────┤
│ App Secret: [Show] button   │ ← Click Show
│ abc123def456ghi789jkl012    │ ← Then Copy This
└─────────────────────────────┘
   ↓
Paste in .env file
```

---

## 📝 What to Copy

### App ID (Visible)
```
Format: 15-16 digit number
Example: 123456789012345
Location: Directly visible
Action: Click [Copy] button
```

### App Secret (Hidden)
```
Format: 32 character alphanumeric
Example: abc123def456ghi789jkl012mno345pq
Location: Hidden as dots (••••••)
Action: Click [Show] → Enter password → Copy
```

---

## 🎯 Where to Paste

**File:** `backend/.env`

**Add these lines:**
```bash
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456ghi789jkl012mno345pq
```

---

## ⚡ Super Quick Commands

```bash
# 1. Open .env
nano backend/.env

# 2. Add (replace with your values):
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# 3. Save
Ctrl+X → Y → Enter

# 4. Verify
cat backend/.env | grep META_APP

# 5. Run setup
npm run setup:facebook-token
```

---

## 🔍 Exact Location in Facebook

```
Facebook Developer Console
    ↓
My Apps
    ↓
[Your App Name]
    ↓
Left Sidebar
    ↓
⚙️ Settings
    ↓
📄 Basic  ← YE PAGE
    ↓
App ID (top)
App Secret (below App ID)
```

---

## 📸 What You'll See

**Page Title:** "Basic Settings"

**Section:** "App Details"

**Fields:**
```
Display Name: [Your App Name]
App ID: [Number] [Copy]
App Secret: [••••••••] [Show]
```

---

## 🚨 Important Notes

### App Secret Security:
- ⚠️ **Never share** publicly
- ⚠️ **Never commit** to git
- ⚠️ **Never screenshot** and share
- ✅ **Only in .env** file

### If "Show" Button Asks Password:
- Enter your **Facebook password**
- This is **normal security** check
- After entering, secret will be visible

---

## ❓ Quick FAQ

**Q: Kahan hai ye page?**
**A:** https://developers.facebook.com/apps/ → Your App → Settings → Basic

**Q: Show button pe click karne ke baad?**
**A:** Password maangega, dalo, phir secret dikhega

**Q: App nahi hai?**
**A:** "Create App" button se banao (2 minutes)

**Q: Multiple apps hain?**
**A:** Jo SarkariPulse se connected hai wo use karo

**Q: Secret change ho sakta hai?**
**A:** Haan, but mat karo. Existing use karo.

---

## ✅ Success Check

**After adding to .env, verify:**

```bash
# Check if added
cat backend/.env | grep META_APP

# Should show:
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456...
```

**If shows above, you're good! ✅**

---

## 🎁 What Happens Next

After adding App ID & Secret:

```bash
npm run setup:facebook-token
```

**Script will:**
1. ✅ Verify App ID & Secret
2. ✅ Guide you to get short-lived token
3. ✅ Convert to never-expiring token
4. ✅ Store in database
5. ✅ Done! Forever automatic!

---

## 📞 Need More Help?

**Detailed Guide:** `HOW_TO_GET_APP_SECRET.md`

**Hindi Guide:** `SETUP_INSTRUCTIONS_HINDI.md`

**Full Docs:** `AUTOMATIC_TOKEN_REFRESH.md`

---

**Direct Link (Copy-Paste in Browser):**
```
https://developers.facebook.com/apps/
```

**Bas Settings → Basic → Show → Copy! 🚀**
