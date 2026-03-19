# 🔧 Fix Token Usage - Panduan Lengkap

## Masalah
Token usage tidak bertambah setelah chat di chatbot.

## Solusi yang Sudah Diterapkan

### 1. ✅ Update Firestore Rules
File `firestore.rules` sudah diperbaiki untuk mengizinkan server-side API update.

### 2. ✅ Update API Route
File `src/app/api/chat/route.ts` sudah diperbaiki dengan:
- Menambahkan `userId` field saat update
- Menambahkan logging untuk debugging
- Menggunakan `setDoc` untuk create dokumen baru

---

## 📋 Langkah yang Harus Dilakukan

### Step 1: Deploy Firestore Rules ke Firebase

1. **Buka Firebase Console**
   - Pergi ke: https://console.firebase.google.com/
   - Pilih project: **ai-chatbot-bearly**

2. **Navigate ke Firestore Database**
   - Klik menu **Firestore Database** di sidebar kiri
   - Klik tab **Rules** di bagian atas

3. **Update Rules**
   - Copy semua isi dari file `firestore.rules`
   - Paste ke editor Rules di Firebase Console
   - Klik tombol **Publish**

4. **Verifikasi Rules**
   - Pastikan tidak ada error
   - Rules harus berhasil di-publish

---

### Step 2: Jalankan Chatbot (Development Mode)

1. **Buka Terminal/Command Prompt**

2. **Navigate ke folder ai-chatbot**
   ```bash
   cd "C:\Users\HYPE AMD\files\belajar koding\AI\Ai chatbot\ai-chatbot"
   ```

3. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

4. **Buka Browser**
   - Pergi ke: http://localhost:3000

---

### Step 3: Test Token Usage

1. **Sign In**
   - Klik tombol "Sign in with Google"
   - Login dengan akun Google kamu

2. **Mulai Chat**
   - Ketik pertanyaan apa saja (contoh: "Hello, how are you?")
   - Kirim pesan dan tunggu response dari AI

3. **Perhatikan Console Log**
   - Buka Developer Tools (tekan F12)
   - Pergi ke tab **Console**
   - Setelah chat selesai, kamu harus melihat log seperti:
     ```
     Updating usage for user {userId}: {tokens} tokens
     Usage updated successfully for user {userId}
     ```

4. **Cek UI Header**
   - Lihat di pojok kanan atas header
   - Token usage indicator harus menunjukkan angka yang bertambah
   - Format: `{tokensUsed} / {dailyLimit}`

---

### Step 4: Verifikasi di Firebase Console

1. **Buka Firebase Console**
   - Pergi ke: https://console.firebase.google.com/
   - Pilih project: **ai-chatbot-bearly**

2. **Navigate ke Firestore Database**
   - Klik menu **Firestore Database** di sidebar kiri

3. **Cek Collection `user_usage`**
   - Klik collection **user_usage**
   - Cari dokumen dengan ID = userId kamu (bisa dilihat di console log)
   - Klik dokumen tersebut

4. **Verifikasi Data**
   - Field `tokensUsedToday` harus berisi angka > 0
   - Field `totalTokensUsed` harus berisi angka > 0
   - Field `userId` harus match dengan UID user kamu
   - Field `updatedAt` harus update setiap kali chat

---

### Step 5: Troubleshooting

#### Masalah 1: Console log tidak muncul

**Solusi:**
- Pastikan Firebase sudah dikonfigurasi dengan benar di `.env.local`
- Cek tab **Network** di Developer Tools
- Pastikan request ke `/api/chat` return status 200

#### Masalah 2: Error "Permission denied" di console

**Solusi:**
- Pastikan Firestore rules sudah di-publish dengan benar
- Tunggu beberapa menit setelah publish rules (propagasi)
- Refresh browser dan coba lagi

#### Masalah 3: Token usage tidak update di UI

**Solusi:**
- Refresh halaman (tekan F5)
- UI seharusnya update otomatis setelah chat selesai
- Jika tidak, cek console untuk error

#### Masalah 4: Error di server console

**Cek log di terminal tempat `npm run dev` berjalan:**
- Jika ada error Firestore, pastikan rules sudah benar
- Jika ada error Firebase, pastikan `.env.local` sudah benar

---

### Step 6: Build untuk Production (Optional)

Jika sudah test dan berhasil, deploy ke production:

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Atau Deploy ke Vercel**
   - Ikuti panduan di `DEPLOYMENT.md`

---

## 📊 Struktur Data Firestore

### Collection: `user_usage`

**Document ID:** `{userId}` (Firebase Auth UID)

**Fields:**
```javascript
{
  userId: string,           // Firebase Auth UID
  userEmail: string,        // Email user
  tier: string,             // 'free', 'premium', atau 'admin'
  tokensUsedToday: number,  // Token yang digunakan hari ini
  dailyLimit: number,       // Batas harian (-1 untuk unlimited)
  lastResetDate: string,    // Tanggal reset terakhir (YYYY-MM-DD)
  totalTokensUsed: number,  // Total token seumur hidup
  createdAt: Timestamp,     // Waktu dibuat
  updatedAt: Timestamp      // Waktu update terakhir
}
```

---

## 🎯 Tier System

| Tier     | Daily Limit | Keterangan |
|----------|-------------|------------|
| free     | 100,000     | Default untuk user baru |
| premium  | 1,000,000   | User premium |
| admin    | -1 (∞)      | Unlimited, admin |

---

## ✅ Checklist Verifikasi

- [ ] Firestore rules sudah di-publish
- [ ] Development server berjalan
- [ ] Sign in berhasil
- [ ] Chat berhasil dikirim dan diterima
- [ ] Console log "Updating usage for user..." muncul
- [ ] Console log "Usage updated successfully..." muncul
- [ ] UI header menunjukkan token usage yang bertambah
- [ ] Firestore `user_usage` collection punya data
- [ ] Field `tokensUsedToday` > 0
- [ ] Field `totalTokensUsed` > 0

---

## 🆘 Butuh Bantuan?

Jika masih ada masalah:

1. **Cek semua log** - Console browser + Terminal server
2. **Screenshot error** - Ambil screenshot error yang muncul
3. **Cek Firebase** - Pastikan project ID dan credentials benar

---

**Last Updated:** 19 March 2026
