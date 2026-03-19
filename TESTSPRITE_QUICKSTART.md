# 🧪 TestSprite MCP - Quick Start Guide

## ✅ Setup Sudah Selesai!

API Key TestSprite kamu sudah dikonfigurasi di `mcp.json`.

---

## 🚀 Cara Run Tests

### Option 1: Via Qwen Code Chat (Recommended)

Setelah MCP server running, gunakan commands ini di chat:

#### Run All Tests
```
Run all TestSprite tests for my chatbot
```

#### Run Specific Test
```
Test token usage tracking - verify token count increases after chat
```

#### Generate New Tests
```
Generate tests for chat history feature
```

---

### Option 2: Via CLI Manual

#### 1. Install TestSprite MCP
```bash
cd "C:\Users\HYPE AMD\files\belajar koding\AI\Ai chatbot\ai-chatbot"
npm install -g @testsprite/testsprite-mcp
```

#### 2. Run Tests
```bash
npx @testsprite/testsprite-mcp --config testsprite-tests.json
```

---

## 📊 Test Suite

### Tests yang Sudah Diconfigurasi:

| Test Name | Description | Status |
|-----------|-------------|--------|
| **Token Usage** | Verify token count increases | ✅ Ready |
| **Chat History** | New chat appears in sidebar | ✅ Ready |
| **Daily Limit** | Input disables when limit exceeded | ✅ Ready |
| **Model Switching** | User can switch models | ✅ Ready |

---

## 🔧 Data TestIDs Available

All elements have `data-testid` attributes:

```javascript
'[data-testid="token-usage"]'      // Token count display
'[data-testid="chat-input"]'       // Chat input field
'[data-testid="model-switcher"]'   // Model dropdown
'[data-testid="sidebar"]'          // Chat sidebar
'[data-testid="chat-item"]'        // Each chat in sidebar
'[data-testid="message"]'          // Chat messages
'[data-testid="limit-exceeded-banner"]' // Limit warning
```

---

## 📈 Test Results

Results akan muncul di:
1. **Console output** - Direct feedback
2. **TestSprite Dashboard** - https://app.testsprite.com/
3. **Vercel Deployment** - Test results linked to deployment

---

## 🐛 Troubleshooting

### MCP Server Not Starting
**Solution:** Restart Qwen Code atau run:
```bash
npx @testsprite/testsprite-mcp@latest --restart
```

### Tests Failing
**Solution:** 
1. Check app is deployed: https://ai-chatbot-plum-chi-39.vercel.app
2. Verify API key is correct in `mcp.json`
3. Check browser console for errors

---

## 🎯 Next Steps

1. ✅ **Run Tests** - Use commands di atas
2. ✅ **Review Results** - Check TestSprite dashboard
3. ✅ **Fix Bugs** - Address any failed tests
4. ✅ **Add More Tests** - Expand coverage

---

**Ready to test!** 🧪

URL Production: https://ai-chatbot-plum-chi-39.vercel.app
