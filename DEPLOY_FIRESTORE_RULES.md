# 🚀 DEPLOY FIRESTORE RULES - Panduan Singkat

## Cara Deploy (2 Menit)

### Step 1: Buka Firebase Console
Klik link ini: **https://console.firebase.google.com/project/ai-chatbot-bearly/firestore/rules**

### Step 2: Copy Semua Isi File Ini
Buka file `firestore.rules` di folder ini, copy SEMUA isinya (Ctrl+A, Ctrl+C)

### Step 3: Paste di Firebase Console
1. Di Firebase Console, hapus semua isi editor rules yang lama
2. Paste rules yang sudah di-copy (Ctrl+V)
3. Klik tombol **"Publish"** (biru, pojok kanan atas)
4. Tunggu sampai muncul "Rules published successfully"

---

## ✅ Firestore Indexes (Wajib!)

Setelah deploy rules, buat 2 indexes ini:

### Index 1: Chats
1. Buka: https://console.firebase.google.com/project/ai-chatbot-bearly/firestore/indexes
2. Klik **"Create Index"**
3. Isi:
   - **Collection ID**: `chats`
   - **Query scope**: `Collection`
   - **Fields**:
     - Field: `userId` → Order: `Ascending`
     - Field: `updatedAt` → Order: `Descending`
4. Klik **"Create"**

### Index 2: Messages
1. Masih di halaman indexes yang sama
2. Klik **"Create Index"** lagi
3. Isi:
   - **Collection ID**: `messages`
   - **Query scope**: `Collection`
   - **Fields**:
     - Field: `chatId` → Order: `Ascending`
     - Field: `createdAt` → Order: `Ascending`
4. Klik **"Create"**

---

## ⏱️ Tunggu Propagasi
- Rules: Langsung aktif
- Indexes: Butuh 5-10 menit (ada status "Building")

---

## 🧪 Test Setelah Deploy
1. Refresh browser chatbot (Ctrl+R)
2. Chat sesuatu
3. Cek sidebar kiri → chat harus muncul
4. Klik chat lama → history harus muncul

---

**Selesai!** 🎉
