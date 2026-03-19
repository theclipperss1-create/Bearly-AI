# 🚀 DEPLOYMENT GUIDE - AI Chatbot Bearly

Complete guide to deploy your AI Chatbot to Vercel with Firebase and custom domain.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Firebase project (already created: `ai-chatbot-bearly`)
- OpenRouter API key (already configured)

---

## 📦 Step 1: Push to GitHub

### 1.1 Initialize Git Repository

```bash
cd "C:\Users\HYPE AMD\files\belajar koding\AI\Ai chatbot\ai-chatbot"
git init
```

### 1.2 Create .gitignore (already exists)

Make sure sensitive files are not committed:
- ✅ `.env.local` - Contains API keys (NEVER commit this!)
- ✅ `node_modules/`
- ✅ `.next/`

### 1.3 Add README.md

```bash
git add .
git commit -m "Initial commit: AI Chatbot Bearly"
```

### 1.4 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ai-chatbot-bearly` (or your preferred name)
3. Visibility: **Public** or **Private** (your choice)
4. Click **Create repository**

### 1.5 Push to GitHub

```bash
# Copy commands from GitHub after creating repo
git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot-bearly.git
git branch -M main
git push -u origin main
```

---

## 🔥 Step 2: Setup Firebase

### 2.1 Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `ai-chatbot-bearly`
3. Go to **Build** → **Authentication**
4. Click **Get started**
5. Enable **Google** sign-in:
   - Click **Google** → Enable
   - Set support email
   - Click **Save**

### 2.2 Setup Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (more secure)
4. Choose location: `asia-southeast1` (Singapore) - closest to Indonesia
5. Click **Enable**

### 2.3 Deploy Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Copy content from `firestore.rules` file
3. Paste and click **Publish**

### 2.4 Get Firebase Config

1. Go to **Project Settings** (⚙️ icon)
2. Scroll to **Your apps**
3. Click **Web** (</>) icon
4. Register app (name: `AI Chatbot Web`)
5. Copy the `firebaseConfig` values
6. Update `.env.local` with these values

---

## ▲ Step 3: Deploy to Vercel

### 3.1 Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **Add New...** → **Project**
3. Import your GitHub repository: `ai-chatbot-bearly`
4. Click **Import**

### 3.2 Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
OPENROUTER_API_KEY=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

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDhxed3OY3TupAsMaMH_nRlVkvQIQE9MtI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-chatbot-bearly.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-chatbot-bearly
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-chatbot-bearly.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=181130338794
NEXT_PUBLIC_FIREBASE_APP_ID=1:181130338794:web:6ba49cd04bd7f8ab031293

NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Click **Visit** to see your live app!

---

## 🌐 Step 4: Setup Custom Domain

### 4.1 Add Domain in Vercel

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain: `your-domain.com`
3. Add www subdomain: `www.your-domain.com`

### 4.2 Configure DNS Records

In your domain registrar (Namecheap, GoDaddy, etc.):

**For root domain (`your-domain.com`):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Automatic
```

**For www subdomain (`www.your-domain.com`):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Automatic
```

### 4.3 Wait for DNS Propagation

- Can take 5 minutes to 48 hours
- Check status in Vercel **Domains** tab
- Vercel will auto-generate SSL certificate

---

## 🔧 Step 5: Post-Deployment Configuration

### 5.1 Update Firebase Authorized Domains

1. Go to Firebase Console → **Authentication** → **Settings**
2. Under **Authorized domains**, add:
   - `your-domain.com`
   - `*.vercel.app`
3. Click **Add domain**

### 5.2 Test Authentication

1. Visit your deployed app
2. Click **Sign in with Google**
3. Verify login works correctly

### 5.3 Setup Admin User

1. Go to your app → `/admin` route
2. Login with your admin email
3. Add admin emails in the admin dashboard

---

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Vercel Analytics

- Go to Vercel dashboard → **Analytics**
- Enable for your project
- Track visitors and performance

### 6.2 Firebase Monitoring

- **Firestore**: Monitor database usage
- **Authentication**: Track sign-ins
- **Usage**: Check user token consumption

### 6.3 OpenRouter Usage

- Monitor API usage at https://openrouter.ai/activity
- Set up billing alerts

---

## 🐛 Troubleshooting

### Build Fails

**Error: Environment variables not found**
- Make sure all env vars are added in Vercel Settings
- Redeploy after adding variables

### Authentication Not Working

**Error: Domain not authorized**
- Add domain in Firebase Authentication settings
- Wait 5 minutes for changes to propagate

### API Errors

**Error: OpenRouter API key invalid**
- Check API key in Vercel environment variables
- Verify key is active at openrouter.ai

### Firestore Errors

**Error: Permission denied**
- Check Firestore security rules are deployed
- Verify user is authenticated

---

## 📈 Performance Optimization

The app is already optimized with:
- ✅ Reduced backdrop-filter effects
- ✅ Simplified animations
- ✅ Throttled scroll updates
- ✅ Efficient Firestore queries
- ✅ Streaming responses

---

## 💰 Cost Estimate

**Free Tier:**
- Vercel: Free (100GB bandwidth/month)
- Firebase: Free (Spark plan)
- OpenRouter: Pay-per-use (~$0.01-0.10 per 1K tokens)

**Estimated monthly cost:** $5-20 depending on usage

---

## 🔐 Security Checklist

- ✅ `.env.local` not committed to Git
- ✅ Firestore security rules deployed
- ✅ Firebase Authentication enabled
- ✅ Rate limiting on API routes
- ✅ User usage limits enforced
- ✅ Admin-only routes protected

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Check Firebase Console logs
4. Review this guide step by step

---

**🎉 Congratulations! Your AI Chatbot is now live!**

Your app URL: `https://your-domain.com`
Admin panel: `https://your-domain.com/admin`
