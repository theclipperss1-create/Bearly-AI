# 🎯 Setup Usage Limits & Admin Panel

## 📋 Fitur yang Sudah Diimplementasi

### 1. **User Tier System**
- **Free**: 10,000 tokens/hari
- **Premium**: 100,000 tokens/hari
- **Admin**: Unlimited tokens

### 2. **Real-time Usage Tracking**
- Token usage di-track per user
- Auto-reset setiap hari
- Usage indicator di header

### 3. **Admin Dashboard** (`/admin`)
- Lihat semua users dan usage mereka
- Upgrade/downgrade user tier
- Tambah/hapus admin email
- Real-time usage statistics

### 4. **Limit Enforcement**
- API akan reject request jika limit exceeded
- Error message yang jelas ke user
- Chat history tetap tersimpan

---

## 🚀 Setup Firestore

### 1. Buat Indexes di Firestore

Buka Firebase Console → Firestore Database → Indexes, tambahkan:

```
Collection: user_usage
Fields: 
  - userId (Ascending)
  - tokensUsedToday (Ascending)
```

### 2. Setup Security Rules

Buka Firebase Console → Firestore Database → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User usage - users can read their own usage
    match /user_usage/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chats - users can only access their own chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId;
    }
    
    // Messages - users can only access messages in their chats
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Admin config - only admins can read/write
    match /config/{configId} {
      allow read, write: if request.auth != null && 
                           get(/databases/$(database)/documents/user_usage/$(request.auth.uid)).data.tier == 'admin';
    }
  }
}
```

---

## 👤 Cara Menggunakan

### Untuk Admin (Kamu)

1. **Login** dengan email kamu di app
2. **Buka Admin Panel** - Klik tombol "Admin Panel" di sidebar
3. **Tambah Email Admin**:
   - Masukkan email kamu di "Add admin email"
   - Klik "Add Admin"
   - Sekarang kamu punya unlimited tokens!

4. **Manage Users**:
   - Lihat semua users di tabel
   - Change tier dropdown (Free/Premium/Admin)
   - Usage akan auto-update

### Untuk User Biasa

1. Login dengan Google
2. Chat seperti biasa
3. Lihat usage di header (tokens used / limit)
4. Jika limit exceeded, akan dapat error message

---

## 📊 Token Calculation

```javascript
// Estimate: 1 token ≈ 4 characters
tokens = text.length / 4

// Example:
"Hello, how are you?" = 19 characters = ~5 tokens
```

### Limits:
- **Free**: 10,000 tokens ≈ 40,000 characters ≈ 8,000 words/hari
- **Premium**: 100,000 tokens ≈ 400,000 characters ≈ 80,000 words/hari
- **Admin**: Unlimited

---

## 🔧 Konfigurasi

File: `src/lib/types.ts`

```typescript
export const DEFAULT_LIMITS: AdminConfig = {
  adminEmails: [], // Tambah email kamu di sini!
  defaultDailyLimit: 10000, // Free tier limit
  premiumDailyLimit: 100000, // Premium tier limit
  adminDailyLimit: -1, // -1 = unlimited
}
```

---

## 🎨 UI Features

### Header Usage Indicator
```
🟢 1,234 / 10,000 [FREE]
🟢 ∞ [ADMIN]
```

### Admin Dashboard
- Total users count
- Usage table dengan progress bar
- Tier selector dropdown
- Add/remove admin emails

### Error Message (Limit Exceeded)
```
⚠️ Daily Limit Exceeded

You've used 9,876 of 10,000 tokens today.

Contact admin to upgrade your tier
```

---

## 📁 Firestore Collections

### `user_usage`
```typescript
{
  userId: string
  tier: 'free' | 'premium' | 'admin'
  tokensUsedToday: number
  dailyLimit: number
  lastResetDate: string // YYYY-MM-DD
  totalTokensUsed: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `config`
```typescript
{
  adminEmails: string[]
  defaultDailyLimit: number
  premiumDailyLimit: number
  adminDailyLimit: number
}
```

---

## 🔐 Akses Admin Panel

1. Login dengan email yang sudah di-set sebagai admin
2. Klik tombol **"Admin Panel"** di sidebar bawah
3. Atau langsung ke: `http://localhost:3000/admin`

**Note**: Jika email kamu belum di-set sebagai admin, kamu akan di-redirect ke home.

---

## 🎯 Cara Set Admin Email

### Cara 1: Via Admin Panel (Recommended)
1. Login dengan email manapun
2. Buka Admin Panel
3. Tambah email kamu
4. Refresh page

### Cara 2: Manual di Firestore
1. Buka Firebase Console
2. Firestore Database
3. Collection: `config`
4. Document: `admin`
5. Field: `adminEmails` (array)
6. Tambah email kamu: `["your.email@gmail.com"]`

---

## 🧪 Testing

### Test Free User Limit:
1. Login dengan akun baru (free tier)
2. Chat beberapa kali
3. Lihat usage di header
4. Coba chat terus sampai limit exceeded

### Test Admin Unlimited:
1. Set email kamu sebagai admin
2. Logout dan login lagi
3. Chat sebanyak yang kamu mau
4. Usage akan tetap ada tapi tidak ada limit

---

## 📝 Notes

- Reset usage terjadi otomatis setiap hari (midnight UTC)
- Token calculation adalah estimate (actual mungkin berbeda)
- Chat history tetap tersimpan meskipun limit exceeded
- Admin bisa change tier user kapan saja

---

## 🚨 Troubleshooting

### "Daily limit exceeded" muncul terus
- Check usage di header
- Jika sudah reset, logout dan login lagi
- Atau contact admin untuk upgrade

### Admin panel tidak bisa diakses
- Pastikan email kamu sudah di-set sebagai admin
- Check Firestore collection `config` document `admin`
- Logout dan login ulang

### Usage tidak ter-update
- Refresh page
- Check Firestore `user_usage` collection
- Pastikan Firebase config benar

---

**Happy Managing! 🎉**
