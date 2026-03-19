# 🧪 TestSprite MCP - Local Testing Setup

## 📋 Setup TestSprite MCP untuk Testing Lokal

### Step 1: Install Node.js (Jika Belum)
Pastikan Node.js sudah terinstall:
```bash
node --version
```

Kalau belum, download: https://nodejs.org/

---

### Step 2: Install TestSprite MCP

```bash
cd "C:\Users\HYPE AMD\files\belajar koding\AI\Ai chatbot\ai-chatbot"
npm install -g @testsprite/testsprite-mcp
```

---

### Step 3: Jalankan Development Server

```bash
npm run dev
```

Server akan jalan di: **http://localhost:3000**

---

### Step 4: Setup MCP Config

File `mcp-config.local.json` sudah dibuat dengan konfigurasi:

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "sk-user-...",
        "BASE_URL": "http://localhost:3000",
        "PROJECT_ID": "bearly-ai-local"
      }
    }
  }
}
```

---

### Step 5: Activate MCP di Qwen Code

#### Option A: Copy ke Qwen Code Settings

1. **Buka Qwen Code Settings**
2. **Cari MCP Configuration**
3. **Copy isi** `mcp-config.local.json`
4. **Paste & Save**

#### Option B: Manual Start

Run di terminal baru:
```bash
npx @testsprite/testsprite-mcp@latest --config mcp-config.local.json
```

---

### Step 6: Run Tests

Setelah MCP aktif, gunakan commands ini di chat:

```
Test my chatbot at http://localhost:3000
```

```
Run token usage tests
```

```
Test chat history functionality
```

```
Check if daily limit enforcement works
```

---

## 🎯 Test Coverage

### Tests yang Bisa Dijalankan:

| Feature | Test Scenario |
|---------|---------------|
| **Sign In** | User can sign in with Google |
| **Chat** | User can send messages and get responses |
| **Token Usage** | Token count increases after chat |
| **Chat History** | Chats save to sidebar |
| **Daily Limit** | Input disables when limit exceeded |
| **Model Switch** | User can change AI models |

---

## 🔧 Data TestIDs

Elements yang bisa di-test:

```javascript
'[data-testid="token-usage"]'      // Token count
'[data-testid="chat-input"]'       // Input field
'[data-testid="model-switcher"]'   // Model dropdown
'[data-testid="sidebar"]'          // Sidebar
'[data-testid="chat-item"]'        // Chat in sidebar
'[data-testid="message"]'          // Messages
'[data-testid="limit-exceeded-banner"]' // Limit warning
```

---

## 📊 View Results

### Console Output
Tests akan show results langsung di terminal

### TestSprite Dashboard
Buka: https://app.testsprite.com/
- Login dengan akun kamu
- Lihat project "bearly-ai-local"

---

## 🐛 Troubleshooting

### MCP Not Starting
```bash
# Clear cache dan reinstall
npm cache clean --force
npm install -g @testsprite/testsprite-mcp
```

### Connection Refused
Pastikan dev server running:
```bash
npm run dev
```

### Tests Failing
1. Check localhost:3000 accessible
2. Clear browser cache
3. Check console for errors

---

## 🚀 Quick Commands

### Start Dev Server
```bash
npm run dev
```

### Run TestSprite MCP
```bash
npx @testsprite/testsprite-mcp@latest
```

### Run Specific Test
```
/testsprite run --test "token usage"
```

### Generate New Tests
```
/testsprite generate --feature "chat history"
```

---

## 📝 Notes

- ✅ **Local Only** - Config tidak di-commit ke Git
- ✅ **BASE_URL** - http://localhost:3000 (bukan Vercel)
- ✅ **API Key** - Sudah terkonfigurasi
- ✅ **Safe** - File `.gitignore` sudah updated

---

**Ready to test locally!** 🧪

URL: http://localhost:3000
