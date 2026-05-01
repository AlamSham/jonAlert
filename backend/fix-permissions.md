# 🔧 Facebook Permissions Fix

## ❌ Current Issue

Token mein **posting permissions** nahi hain:
```
Error: requires both pages_read_engagement and pages_manage_posts
```

---

## ✅ Solution (2 Options)

### Option 1: Page Access Token (EASIEST - 2 minutes)

#### Step 1: Graph API Explorer Kholo
```
https://developers.facebook.com/tools/explorer/
```

#### Step 2: Token Type Change Karo
```
Top mein "User or Page" dropdown
    ↓
"Get Page Access Token" select karo
    ↓
Apna page "sarkariPulse" select karo
```

#### Step 3: Token Copy Karo
```
Token automatically generate hoga with all permissions
    ↓
Copy karo
    ↓
.env mein META_PAGE_ACCESS_TOKEN update karo
```

#### Step 4: Test Karo
```bash
npm run test:facebook
```

---

### Option 2: Setup Script Use Karo (PERMANENT - 5 minutes)

Ye never-expiring token dega!

#### Step 1: User Access Token Lo

**Graph API Explorer:**
```
https://developers.facebook.com/tools/explorer/
```

1. **"User or Page"** → **"Get User Access Token"**
2. **Permissions select karo:**
   - ✅ pages_manage_posts
   - ✅ pages_read_engagement  
   - ✅ pages_show_list
3. **Generate Token**
4. **Copy karo**

#### Step 2: Setup Script Run Karo

```bash
npm run setup:facebook-token
```

**Paste token when prompted**

#### Step 3: Magic! ✨

```
✅ Token setup completed successfully!
📄 Page Token:
   Expires: NEVER ✅
   All permissions: ✅
```

---

## 🎯 Recommended: Option 1 (Quick Fix)

**Abhi ke liye:**
1. Graph API Explorer kholo
2. "Get Page Access Token" select karo
3. Page select karo
4. Token copy karo
5. .env update karo
6. Test karo

**Time:** 2 minutes
**Result:** Immediate fix

---

## 🚀 Later: Option 2 (Permanent)

**Baad mein:**
1. Setup script run karo
2. Never-expiring token milega
3. Automatic management

**Time:** 5 minutes
**Result:** Forever solution

---

## 📝 Quick Commands

### Option 1:
```bash
# 1. Get Page Access Token from Graph API Explorer
# 2. Update .env
nano backend/.env
# Update: META_PAGE_ACCESS_TOKEN=new_token

# 3. Test
npm run test:facebook
```

### Option 2:
```bash
# 1. Get User Access Token from Graph API Explorer
# 2. Run setup
npm run setup:facebook-token
# 3. Paste token
# 4. Done!
```

---

**Recommendation:** Pehle Option 1 try karo (quick), phir Option 2 (permanent)! 🚀
