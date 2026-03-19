# 👨‍💼 Admin Setup Guide

Cara setup admin panel untuk pertama kali.

---

## 🚀 Step 1: Akses Halaman Setup Admin

### Untuk Local Development:
```
http://localhost:3000/setup-admin
```

### Untuk Production (setelah deploy):
```
https://your-domain.com/setup-admin
```

---

## 📝 Step 2: Login dengan Google

1. Buka halaman `/setup-admin`
2. Kamu akan otomatis diminta login dengan Google
3. Pilih email yang ingin dijadikan **admin pertama**

---

## ✅ Step 3: Klik "Become Admin"

1. Setelah login, kamu akan lihat email kamu
2. Klik tombol **"Become Admin"**
3. Tunggu proses setup selesai
4. Kamu akan otomatis redirect ke `/admin` dashboard

---

## 🎯 Step 4: Manage Admin Lainnya

Setelah jadi admin, kamu bisa add/remove admin lain dari admin panel:

1. Buka `/admin`
2. Scroll ke bagian **"Admin Configuration"**
3. Lihat daftar **Admin Emails**
4. **Add Admin**:
   - Ketik email di "Add admin email..."
   - Klik **Add Admin**
5. **Remove Admin**:
   - Klik tombol **X** di sebelah email

---

## 🔐 Security Notes

- ⚠️ **Hanya halaman `/setup-admin` yang bisa create admin pertama**
- ✅ **Setelah ada admin, hanya admin yang bisa add/remove admin lain**
- 🔒 **Setup admin page akan otomatis redirect kalau admin sudah ada**
- 👤 **Email admin disimpan di Firestore collection `config` document `admin`**

---

## 📊 Admin Capabilities

Sebagai admin, kamu bisa:

| Feature | Description |
|---------|-------------|
| 👥 **Manage Users** | Lihat semua user dan usage mereka |
| 🎫 **Change User Tiers** | Upgrade/downgrade user (Free → Premium → Admin) |
| 📧 **Add/Remove Admins** | Tambah atau hapus admin lain |
| 📈 **View Analytics** | Lihat total usage dan tokens |
| ∞ **Unlimited Tokens** | Admin tidak ada limit token |

---

## 🔄 Reset Admin (Jika Diperlukan)

Jika kamu kehilangan akses admin:

### Option 1: Via Firebase Console
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project `ai-chatbot-bearly`
3. Go to **Firestore Database**
4. Find collection: `config` → document: `admin`
5. Edit field `adminEmails` array
6. Add email kamu

### Option 2: Delete dan Setup Ulang
1. Di Firebase Console, delete document `config/admin`
2. Akses `/setup-admin` lagi
3. Login dengan email baru

---

## 🌐 Production Setup

Setelah deploy ke Vercel:

1. **Setup admin pertama**: `https://your-domain.com/setup-admin`
2. **Login dengan email admin** yang sudah didaftarkan
3. **Add admin lain** dari dashboard jika perlu

---

## 📱 Access Admin Panel

| URL | Purpose |
|-----|---------|
| `/setup-admin` | First-time admin setup ONLY |
| `/admin` | Admin dashboard (requires admin email) |
| `/` | Main chat app (public) |

---

## ⚠️ Important Notes

1. **Setup admin page hanya bisa digunakan SEKALI**
   - Setelah admin pertama dibuat, halaman ini akan redirect ke `/admin`
   
2. **Simpan email admin dengan baik**
   - Hanya admin yang bisa akses `/admin`
   
3. **Minimal 1 admin harus ada**
   - Kalau semua admin dihapus, tidak ada yang bisa manage system

---

## 🆘 Troubleshooting

### "Redirected to home" saat akses `/admin`
- Email kamu belum terdaftar sebagai admin
- Solusi: Minta admin existing untuk add email kamu

### "Setup admin" muncul terus
- Firestore belum terkonfigurasi dengan benar
- Solusi: Check Firebase connection di `.env.local`

### Tidak bisa add admin baru
- Pastikan format email benar
- Check Firestore security rules sudah deployed

---

**Done!** Sekarang kamu punya full control atas AI Chatbot kamu! 🎉

[Back to Deployment Guide](./DEPLOYMENT.md) | [Back to README](./README.md)
