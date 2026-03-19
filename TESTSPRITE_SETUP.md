# 🧪 TestSprite MCP Integration Guide

## 📋 Setup TestSprite dengan MCP

### Step 1: Dapatkan TestSprite API Key

1. Buka https://www.testsprite.com/
2. Sign Up / Login
3. Buka **Settings** → **API Keys**
4. Click **"Generate New API Key"**
5. Copy API key kamu

---

### Step 2: Setup Environment Variables

Buat file `.env.testsprite` di root folder:

```bash
# TestSprite API Configuration
TESTSPRITE_API_KEY=your_testsprite_api_key_here
TESTSPRITE_PROJECT_ID=bearly-ai-chatbot
TESTSPRITE_BASE_URL=https://ai-chatbot-rust-six-13.vercel.app
```

**Ganti `your_testsprite_api_key_here` dengan API key kamu!**

---

### Step 3: Install TestSprite MCP

```bash
cd "C:\Users\HYPE AMD\files\belajar koding\AI\Ai chatbot\ai-chatbot"
npm install -g @testsprite/mcp
```

---

### Step 4: Configure MCP di Qwen Code

File `mcp.json` sudah dibuat dengan konfigurasi:

```json
{
  "mcpServers": {
    "testsprite": {
      "command": "npx",
      "args": ["-y", "@testsprite/mcp@latest"],
      "env": {
        "TESTSPRITE_API_KEY": "${TESTSPRITE_API_KEY}",
        "TESTSPRITE_PROJECT_ID": "${TESTSPRITE_PROJECT_ID}",
        "TESTSPRITE_BASE_URL": "https://ai-chatbot-rust-six-13.vercel.app"
      }
    }
  }
}
```

---

### Step 5: Run TestSprite MCP

**Option A: Via Qwen Code (Recommended)**

1. Restart Qwen Code
2. MCP server akan auto-load dari `mcp.json`
3. TestSprite commands akan tersedia di chat

**Option B: Via CLI**

```bash
cd "C:\Users\HYPE AMD\files\belajar koding\AI\Ai chatbot\ai-chatbot"
npx @testsprite/mcp@latest --config testsprite.config.json
```

---

## 🎯 TestSprite Commands

Setelah MCP setup, kamu bisa gunakan commands ini di chat:

### Run All Tests
```
/testsprite run --all
```

### Run Specific Feature
```
/testsprite run --feature "Token Usage Tracking"
```

### Run Single Test
```
/testsprite run --test "token count increases after chat"
```

### Generate New Tests
```
/testsprite generate --feature "Chat History"
```

### Check Test Status
```
/testsprite status
```

---

## 📊 Test Coverage

### Features yang di-Test:

#### 1. **Authentication** ✅
- [ ] user can sign in with Google
- [ ] user can sign out
- [ ] authenticated user sees email in sidebar

#### 2. **Chat Functionality** ✅
- [ ] user can send a message
- [ ] AI response appears after user message
- [ ] streaming response displays correctly
- [ ] response text is not garbled or corrupted

#### 3. **Token Usage Tracking** ✅
- [ ] token usage displays in header
- [ ] token count increases after chat
- [ ] token usage updates in real-time

#### 4. **Daily Limit Enforcement** ✅
- [ ] limit warning appears when tokens exhausted
- [ ] input field disables when limit exceeded
- [ ] user cannot send messages when limit reached

#### 5. **Chat History** ✅
- [ ] new chat appears in sidebar
- [ ] clicking chat loads conversation history
- [ ] multiple chats can coexist
- [ ] chat title updates based on first message

#### 6. **Model Switching** ✅
- [ ] model dropdown displays all available models
- [ ] user can switch between models
- [ ] selected model persists across chats

#### 7. **Auto-Delete (5 Days)** ✅
- [ ] chats older than 5 days are deleted on load
- [ ] deleted chats do not appear in sidebar

---

## 🔧 Data TestIDs

Semua elemen penting sudah punya `data-testid`:

| Element | Data TestID |
|---------|-------------|
| Token Usage Display | `token-usage` |
| Chat Input | `chat-input` |
| Model Switcher | `model-switcher` |
| Sidebar | `sidebar` |
| Chat Item | `chat-item` |
| Message | `message` |
| Limit Banner | `limit-exceeded-banner` |

---

## 🚀 Quick Start

### 1. Setup API Key
```bash
# Edit .env.testsprite
TESTSPRITE_API_KEY=sk_test_your_key_here
```

### 2. Install MCP
```bash
npm install -g @testsprite/mcp
```

### 3. Run Tests
```bash
/testsprite run --all
```

### 4. View Results
- Test results akan muncul di chat
- Detailed report di https://app.testsprite.com/

---

## 📈 CI/CD Integration

### GitHub Actions

Buat file `.github/workflows/testsprite.yml`:

```yaml
name: TestSprite Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install TestSprite MCP
        run: npm install -g @testsprite/mcp
      
      - name: Run TestSprite Tests
        env:
          TESTSPRITE_API_KEY: ${{ secrets.TESTSPRITE_API_KEY }}
          TESTSPRITE_BASE_URL: https://ai-chatbot-rust-six-13.vercel.app
        run: |
          npx @testsprite/mcp@latest run --all --ci
```

---

## 🐛 Troubleshooting

### Error: "API Key not found"
**Solution:** Pastikan `.env.testsprite` sudah dibuat dan API key benar

### Error: "MCP server not responding"
**Solution:** Restart Qwen Code atau run `npx @testsprite/mcp@latest --restart`

### Error: "Test failed: element not found"
**Solution:** Pastikan website sudah deployed dan URL benar di `testsprite.config.json`

---

## 📚 Resources

- **TestSprite Docs**: https://docs.testsprite.com/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Playwright**: https://playwright.dev/

---

**Ready to test!** 🧪
