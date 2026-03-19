# ==================================
# 🚀 QUICK SETUP GUIDE
# ==================================
# Follow these steps to deploy your AI Chatbot
# ==================================

## 🔴 STEP 1: SETUP GITHUB (DO THIS FIRST!)

1. Open Command Prompt in this folder
2. Run these commands ONE BY ONE:

   ```
   git init
   git add .
   git commit -m "Initial commit: AI Chatbot Bearly"
   ```

3. Go to: https://github.com/new
4. Create new repository named: `ai-chatbot-bearly`
5. Copy the commands from GitHub and run:

   ```
   git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot-bearly.git
   git branch -M main
   git push -u origin main
   ```

---

## 🔥 STEP 2: VERIFY FIREBASE

Your Firebase is already configured with:
- Project ID: `ai-chatbot-bearly`
- API Key: Already in `.env.local`

✅ Check Firebase Console:
https://console.firebase.google.com/project/ai-chatbot-bearly

Make sure:
1. Authentication is enabled (Google Sign-In)
2. Firestore Database is created
3. Security rules are deployed (copy from firestore.rules)

---

## ▲ STEP 3: DEPLOY TO VERCEL

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import: `ai-chatbot-bearly`
5. Add Environment Variables (copy from .env.local):
   - OPENROUTER_API_KEY
   - All NEXT_PUBLIC_FIREBASE_* variables
6. Click Deploy!

---

## 👨‍💼 STEP 4: SETUP ADMIN (IMPORTANT!)

After deployment, setup admin access:

### Option A: First-Time Admin Setup
1. Visit: `https://your-domain.com/setup-admin`
2. Login with Google (use your main email)
3. Click "Become Admin"
4. Done! You're now admin

### Option B: Manual via Firebase
1. Go to Firebase Console → Firestore Database
2. Create collection: `config`
3. Add document: `admin`
4. Add field: `adminEmails` (array)
5. Add your email to the array

---

## 🌐 STEP 5: ADD CUSTOM DOMAIN (OPTIONAL)

After deployment:
1. Go to Vercel → Settings → Domains
2. Add your domain
3. Update DNS records at your domain registrar
4. Wait for SSL (5-10 minutes)

---

## 📚 DOCUMENTATION FILES

- `DEPLOYMENT.md` - Complete deployment guide
- `FIREBASE_SETUP.md` - Firebase setup details
- `VERCEL_SETUP.md` - Vercel step-by-step
- `ADMIN_SETUP_GUIDE.md` - Admin panel guide
- `firestore.rules` - Security rules for Firestore
- `.env.example` - Environment variables template

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before deploying, make sure:
- [ ] Git repository initialized
- [ ] Code pushed to GitHub
- [ ] Firebase Authentication enabled
- [ ] Firestore Database created
- [ ] Environment variables ready
- [ ] OpenRouter API key valid
- [ ] Plan for admin setup

---

## 🎯 ACCESS POINTS

| URL | Purpose |
|-----|---------|
| `/` | Main chat (public) |
| `/admin` | Admin dashboard (admin only) |
| `/setup-admin` | First-time admin setup |

---

## 🆘 NEED HELP?

1. Check ADMIN_SETUP_GUIDE.md for admin setup
2. Check DEPLOYMENT.md for detailed deployment
3. Check browser console for errors
4. Check Vercel deployment logs

---

**Last updated:** March 2026
**Project:** AI Chatbot Bearly
**Version:** 1.0.0
