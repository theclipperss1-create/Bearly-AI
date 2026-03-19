# 🤖 AI Chatbot Bearly

AI Chatbot powered by OpenRouter with multiple model support, user authentication, usage tracking, and admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-9.23.0-orange?logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.1-cyan?logo=tailwindcss)

## ✨ Features

### 🎯 Core Features
- **Multi-Model AI Support**
  - GPT-3.5 Turbo
  - Step 3.5 Flash (Free)
  - Llama 3 70B
- **Real-time Streaming** - Get responses as they're generated
- **Chat History** - All conversations saved and accessible
- **User Authentication** - Secure Google Sign-In
- **Usage Tracking** - Monitor token consumption per user
- **Tier System** - Free, Premium, and Admin tiers with different limits

### 🛡️ Security Features
- **Firestore Security Rules** - User-specific data access control
- **API Rate Limiting** - Prevent abuse
- **Environment Variables** - API keys never exposed to client
- **Admin-Only Routes** - Protected dashboard

### 🎨 UI/UX Features
- **Modern Design** - Beautiful gradient UI with glassmorphism
- **Responsive** - Works on all devices
- **Dark Mode** - Easy on the eyes
- **Smooth Animations** - Powered by Framer Motion
- **Auto-scroll** - Always see latest messages

### 🔧 Admin Features
- **User Management** - View all users, update tiers, reset usage
- **Analytics Dashboard** - Track usage statistics
- **Admin Configuration** - Add/remove admin emails
- **Real-time Stats** - Monitor active users and tokens

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- OpenRouter API key

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-chatbot-bearly.git
cd ai-chatbot-bearly/ai-chatbot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# - Add your OpenRouter API key
# - Add your Firebase config
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
ai-chatbot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   └── chat/          # Chat API endpoint
│   │   ├── admin/             # Admin dashboard
│   │   ├── setup-admin/       # First-time admin setup
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main chat page
│   ├── components/
│   │   ├── ChatMessage.tsx    # Message component
│   │   ├── ModelSwitcher.tsx  # Model selector
│   │   └── Sidebar.tsx        # Chat history sidebar
│   ├── hooks/
│   │   └── useAuth.ts         # Authentication hook
│   ├── lib/
│   │   ├── firebase.ts        # Firebase config
│   │   ├── firestore.ts       # Firestore functions
│   │   ├── types.ts           # TypeScript types
│   │   └── usage.ts           # Usage tracking
│   └── middleware.ts          # Rate limiting
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind config
└── package.json
```

---

## 🔐 Environment Variables

Create `.env.local` with:

```env
# OpenRouter API
OPENROUTER_API_KEY=your_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**⚠️ IMPORTANT:** Never commit `.env.local` to Git!

---

## 📦 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Add environment variables
4. Deploy!

### Setup Custom Domain

1. Add domain in Vercel Settings → Domains
2. Update DNS records:
   - A Record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
3. Add domain to Firebase Authentication → Authorized domains

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete guide.

---

## 🎯 Usage Limits

| Tier | Daily Limit | Description |
|------|-------------|-------------|
| **Free** | 10,000 tokens | Default for new users |
| **Premium** | 100,000 tokens | Upgraded tier |
| **Admin** | Unlimited (∞) | Full access |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google)
- **AI**: OpenRouter API (Multiple models)

---

## 📚 Documentation

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Complete deployment guide
- [Custom Domain Setup](./CUSTOM_DOMAIN_SETUP.md) - Domain configuration
- [Vercel Setup Guide](./VERCEL_SETUP.md) - Vercel deployment
- [Admin Panel README](./admin-panel/README.md) - Admin dashboard docs

---

## 🔒 Security

- ✅ Environment variables never exposed
- ✅ Firestore security rules enforced
- ✅ User-specific data access control
- ✅ Rate limiting on API routes
- ✅ Admin-only protected routes
- ✅ `.env` files in `.gitignore`

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai) - AI API provider
- [Firebase](https://firebase.google.com) - Backend services
- [Next.js](https://nextjs.org) - React framework
- [Vercel](https://vercel.com) - Hosting platform

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: Open an issue on GitHub
- **Email**: your-email@example.com

---

**Made with ❤️ by Your Name**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-chatbot-bearly)
