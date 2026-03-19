# 🚀 VERCEL SETUP GUIDE

Complete step-by-step guide to deploy your AI Chatbot to Vercel.

---

## 📋 Step 1: Prepare Your Code

### ✅ Make sure:
- [ ] Code is working locally (`npm run dev`)
- [ ] `.env.local` has correct values
- [ ] Git is initialized (run `git-setup.bat`)

---

## 📦 Step 2: Push to GitHub

### Option A: Use the Script (Recommended)

1. Double-click `git-setup.bat`
2. Follow the instructions
3. Create GitHub repo at: https://github.com/new

### Option B: Manual Commands

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: AI Chatbot Bearly"
git branch -M main

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot-bearly.git

# Push to GitHub
git push -u origin main
```

---

## ▲ Step 3: Deploy to Vercel

### 3.1 Sign In to Vercel

1. Go to https://vercel.com
2. Click **Sign In**
3. Sign in with GitHub (recommended) or email

### 3.2 Import Project

1. Click **Add New...** → **Project**
2. Under **Import Git Repository**, find `ai-chatbot-bearly`
3. Click **Import**

### 3.3 Configure Project

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (leave as default)
**Build Command:** `npm run build` (auto-filled)
**Output Directory:** `.next` (auto-filled)

### 3.4 Add Environment Variables

Click **Environment Variables** → **Add Variable**

Copy from `.env.local`:

| Name | Value |
|------|-------|
| `OPENROUTER_API_KEY` | `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` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDhxed3OY3TupAsMaMH_nRlVkvQIQE9MtI` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `ai-chatbot-bearly.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `ai-chatbot-bearly` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `ai-chatbot-bearly.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `181130338794` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:181130338794:web:6ba49cd04bd7f8ab031293` |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (add after deploy) |

### 3.5 Deploy!

1. Click **Deploy**
2. Wait 2-3 minutes for build
3. Click **Visit** to see your app!

---

## 🌐 Step 4: Add Custom Domain (Optional)

### 4.1 In Vercel Dashboard

1. Go to project → **Settings** → **Domains**
2. Add your domain: `your-domain.com`
3. Add www: `www.your-domain.com`

### 4.2 Configure DNS

In your domain registrar (Namecheap, GoDaddy, etc.):

**Root Domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 Wait for SSL

- Vercel auto-generates SSL certificate
- Takes 5-10 minutes usually
- Status shows in **Domains** tab

---

## 🔥 Step 5: Update Firebase

### 5.1 Add Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `ai-chatbot-bearly`
3. **Authentication** → **Settings**
4. Under **Authorized domains**, add:
   - `your-domain.com`
   - `*.vercel.app`

### 5.2 Update SITE_URL

In Vercel **Settings** → **Environment Variables**:
- Update `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com`
- Redeploy (Vercel does this automatically)

---

## ✅ Step 6: Test Everything

### Test Checklist:
- [ ] App loads at `https://your-domain.com`
- [ ] Sign in with Google works
- [ ] Can send messages to AI
- [ ] Chat history saves
- [ ] Admin panel accessible (`/admin`)

---

## 🔧 Troubleshooting

### Build Failed

**Error: Environment variables not found**
- Go to Vercel → Settings → Environment Variables
- Make sure all 8 variables are added
- Redeploy

### Authentication Not Working

**Error: Domain not authorized**
- Add domain in Firebase Authentication settings
- Wait 5 minutes
- Clear browser cache

### API Errors

**Error: OpenRouter API key invalid**
- Check API key in Vercel environment variables
- Verify at https://openrouter.ai/activity

### 404 on Pages

- Make sure `next.config.js` is correct
- Redeploy the project

---

## 📊 Monitor Your App

### Vercel Dashboard
- **Analytics**: View visitor stats
- **Deployments**: See deployment history
- **Logs**: Check server logs

### Firebase Console
- **Firestore**: Database usage
- **Authentication**: User sign-ins
- **Usage**: Token consumption

### OpenRouter
- **Activity**: API usage and costs
- **Keys**: Manage API keys

---

## 💰 Cost Estimate

**Free Tier:**
- Vercel: Free (100GB bandwidth/month)
- Firebase: Free (Spark plan limits)
- OpenRouter: ~$0.01-0.10 per 1K tokens

**Typical monthly cost:** $5-20 for moderate usage

---

## 🔄 Update Your App

After making changes:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will **auto-deploy** on push to `main` branch!

---

## 🎉 Congratulations!

Your AI Chatbot is now live on Vercel!

**Your URLs:**
- Production: `https://your-domain.com`
- Vercel Preview: `https://ai-chatbot-bearly.vercel.app`
- Admin Panel: `https://your-domain.com/admin`

---

**Need Help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for more details.
