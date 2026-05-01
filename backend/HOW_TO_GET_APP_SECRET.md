# 🔑 META_APP_SECRET Kaise Milega - Step by Step

## 📍 Step 1: Facebook Developer Console Kholo

**Link:** https://developers.facebook.com/apps/

```
Browser mein ye link kholo:
https://developers.facebook.com/apps/
```

---

## 📍 Step 2: Login Karo

Apne Facebook account se login karo (jo tumhare SarkariPulse page ka admin hai)

---

## 📍 Step 3: Apps List Dekho

Login ke baad tumhe **apne apps ki list** dikhegi.

**Agar tumhare paas already app hai:**
- List mein dikhega (jaise "SarkariPulse" ya koi aur naam)
- Us app pe **click karo**

**Agar app nahi hai:**
- **"Create App"** button pe click karo
- Type select karo: **"Business"**
- App name do: **"SarkariPulse"**
- Email do
- Create karo

---

## 📍 Step 4: Settings → Basic Pe Jao

App open hone ke baad:

```
Left sidebar mein:
Settings (⚙️ icon)
    ↓
Basic (click karo)
```

Ya directly:
```
Left menu → Settings → Basic
```

---

## 📍 Step 5: App ID aur App Secret Dekho

**Settings → Basic** page pe tumhe ye dikhega:

```
┌─────────────────────────────────────────┐
│ App ID                                   │
│ 123456789012345                    [Copy]│
├─────────────────────────────────────────┤
│ App Secret                               │
│ ••••••••••••••••••••••••••••      [Show]│
└─────────────────────────────────────────┘
```

### App ID:
- **Directly visible** hai
- Number format mein (jaise: 123456789012345)
- **Copy button** pe click karke copy karo

### App Secret:
- **Hidden** hai (dots mein dikhta hai: ••••••••)
- **"Show" button** pe click karo
- Password confirm karna pad sakta hai
- Phir **actual secret** dikhega (jaise: abc123def456ghi789)
- **Copy karo**

---

## 📍 Step 6: Copy Karo

### App ID Copy Karo:
```
App ID: 123456789012345
        ↑
    [Copy] button pe click
```

### App Secret Copy Karo:
```
App Secret: ••••••••••••••••
            ↑
        [Show] button pe click
            ↓
App Secret: abc123def456ghi789jkl012
            ↑
        Copy karo (Ctrl+C)
```

---

## 📍 Step 7: .env File Mein Paste Karo

```bash
cd backend
nano .env
```

**Paste karo:**
```bash
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456ghi789jkl012
```

**Save karo:** Ctrl+X → Y → Enter

---

## 🎯 Visual Guide

### Facebook Developer Console Layout:

```
┌────────────────────────────────────────────────────┐
│ Facebook for Developers                             │
├────────────────────────────────────────────────────┤
│                                                     │
│  My Apps                                            │
│  ┌──────────────────────────────────────┐         │
│  │  📱 SarkariPulse                      │         │
│  │  App ID: 123456789012345              │         │
│  │  [Open App]                           │         │
│  └──────────────────────────────────────┘         │
│                                                     │
│  [+ Create App]                                     │
│                                                     │
└────────────────────────────────────────────────────┘
```

### App Dashboard (After Opening App):

```
┌────────────────────────────────────────────────────┐
│ SarkariPulse                                        │
├──────────┬─────────────────────────────────────────┤
│          │                                          │
│ Dashboard│  App Settings                            │
│          │                                          │
│ Settings │  ┌────────────────────────────────────┐ │
│  ⚙️       │  │ App ID                             │ │
│  Basic ← │  │ 123456789012345          [Copy]    │ │
│  Advanced│  ├────────────────────────────────────┤ │
│          │  │ App Secret                         │ │
│ Products │  │ ••••••••••••••••••      [Show] ←  │ │
│          │  └────────────────────────────────────┘ │
│ Roles    │                                          │
│          │  Display Name: SarkariPulse              │
│          │  Contact Email: your@email.com           │
│          │                                          │
└──────────┴─────────────────────────────────────────┘
```

---

## 🔐 Security Note

**App Secret** bahut important hai! Ye **password** ki tarah hai.

⚠️ **NEVER:**
- Git mein commit mat karo
- Public mat karo
- Screenshot share mat karo
- Anyone ko mat batao

✅ **ONLY:**
- .env file mein rakho
- .env file .gitignore mein hai (already safe)

---

## 📝 Example Values

**Ye example hai (real nahi):**

```bash
# Example (NOT REAL)
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456ghi789jkl012mno345pq
```

**Tumhara actual values:**
- App ID: 15-16 digits ka number hoga
- App Secret: 32 characters ka alphanumeric string hoga

---

## ❓ Common Questions

### Q: "Show" button nahi dikh raha?
**A:** Page scroll down karo, ya browser zoom out karo (Ctrl + -)

### Q: Password maang raha hai?
**A:** Apna Facebook password dalo (security ke liye)

### Q: App Secret change kar sakta hoon?
**A:** Haan, "Reset App Secret" button hai, but mat karo abhi

### Q: Agar app nahi hai?
**A:** "Create App" button se naya banao:
1. Type: Business
2. Name: SarkariPulse
3. Email: tumhara email
4. Create

### Q: Multiple apps hain?
**A:** Jo app tumhare SarkariPulse page se connected hai, wo use karo

---

## 🎯 Quick Checklist

Setup ke liye ye chahiye:

- [ ] Facebook Developer Console access
- [ ] App created (ya existing app)
- [ ] Settings → Basic page khola
- [ ] App ID copy kiya
- [ ] "Show" button pe click kiya
- [ ] App Secret copy kiya
- [ ] .env file mein paste kiya
- [ ] File save kiya

---

## 🚀 Next Steps

**After adding to .env:**

```bash
# 1. Verify karo ki add ho gaya
cat backend/.env | grep META_APP

# Expected output:
# META_APP_ID=123456789012345
# META_APP_SECRET=abc123def456...

# 2. Setup script run karo
npm run setup:facebook-token

# 3. Follow the prompts
# 4. Done!
```

---

## 📞 Still Confused?

**Agar abhi bhi problem hai:**

1. **Screenshot lo** Settings → Basic page ka
2. **Mujhe bhejo** (App Secret hide karke)
3. Main exactly bata dunga kahan hai

**Ya:**

Video tutorial dekho:
- YouTube pe search karo: "Facebook App Secret kaise nikale"
- Ya: "How to get Facebook App Secret"

---

**Bas Settings → Basic → Show button → Copy! 🔑**

Itna hi simple hai! 😊
