# 🚀 Setup Firebase & Menjalankan AI Chatbot

## Langkah 1: Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add project"** atau **"Create a project"**
3. Masukkan nama project (contoh: `ai-chatbot-bearly`)
4. Klik **Continue**
5. (Opsional) Enable Google Analytics
6. Klik **Create project**

## Langkah 2: Setup Authentication

1. Di Firebase Console, pilih project kamu
2. Di menu kiri, klik **Build** → **Authentication**
3. Klik **Get started**
4. Pilih **Sign-in method** tab
5. Klik **Google**, lalu:
   - Enable **Email** (untuk support Google Sign-In)
   - Masukkan support email kamu
   - Klik **Save**

## Langkah 3: Setup Firestore Database

1. Di menu kiri, klik **Build** → **Firestore Database**
2. Klik **Create database**
3. Pilih **Start in test mode** (untuk development)
4. Pilih lokasi server (pilih yang terdekat, contoh: `asia-southeast1` untuk Singapore)
5. Klik **Enable**

## Langkah 4: Dapatkan Firebase Config

1. Di Firebase Console, klik icon **Settings** (⚙️) di samping **Project Overview**
2. Pilih **Project settings**
3. Scroll ke bawah ke bagian **Your apps**
4. Klik icon **Web** (</>)
5. Masukkan app nickname (contoh: `AI Chatbot Web`)
6. Klik **Register app**
7. Copy konfigurasi Firebase yang muncul (firebaseConfig object)

## Langkah 5: Update .env.local

Buka file `.env.local` dan update dengan konfigurasi Firebase kamu:

```env
# OpenRouter API (sudah ada)
OPENROUTER_API_KEY=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

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (dari Firebase config)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Site URL (optional)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Langkah 6: Jalankan Development Server

```bash
cd "C:\Users\HYPE AMD\files\belajar koding\AI\Ai chatbot\ai-chatbot"
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

## Langkah 7: Build untuk Production

```bash
npm run build
npm start
```

## Fitur yang Sudah Berfungsi

✅ Chat dengan AI (OpenRouter API)
✅ Streaming response
✅ Multi-model AI (GPT-3.5, Llama 3, Step 3.5 Flash)
✅ Firebase Authentication (Google Sign-In)
✅ Chat history di Firestore
✅ Apple-style UI yang premium
✅ Responsive design (Desktop + Mobile)
✅ Copy message
✅ Regenerate response
✅ Delete chat
✅ Sign in / Sign out

## Troubleshooting

### Firebase tidak terkoneksi
- Pastikan semua environment variables di `.env.local` sudah benar
- Restart development server setelah update `.env.local`
- Cek browser console untuk error

### Authentication tidak bekerja
- Pastikan Google Sign-In sudah enabled di Firebase Console
- Cek apakah Firebase config sudah benar
- Clear browser cache dan cookies

### Chat history tidak muncul
- Pastikan Firestore Database sudah dibuat
- Cek security rules di Firestore (gunakan test mode untuk development)

## Security Rules untuk Firestore (Production)

Setelah development, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deploy ke Vercel

1. Push code ke GitHub
2. Buka [Vercel](https://vercel.com)
3. Import repository kamu
4. Tambahkan environment variables di Vercel:
   - OPENROUTER_API_KEY
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID
5. Klik **Deploy**

---

**Enjoy your AI Chatbot! 🎉**
