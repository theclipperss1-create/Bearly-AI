# 🔒 SECURITY GUIDE

Security measures and best practices for AI Chatbot Bearly.

---

## 🔐 Sensitive Files (PRIVATE)

The following files contain sensitive information and should **NEVER** be committed to Git:

### Environment Files
```
.env.local              # Contains API keys and secrets
.env                    # Production environment variables
.env.development.local  # Development-specific secrets
.env.test.local         # Test environment secrets
.env.production.local   # Production-specific secrets
```

### Firebase Service Account Keys
```
*.service-account.json       # Firebase service account credentials
.service-account-keys.json   # Service account private keys
```

### Build Artifacts
```
.next/                  # Next.js build output
node_modules/           # Dependencies
out/                    # Static export
```

### IDE & Editor Files
```
.idea/                  # IntelliJ IDEA
.vscode/                # VS Code settings
*.swp, *.swo            # Vim swap files
.DS_Store               # macOS system files
```

---

## ✅ What's Already Protected

### 1. `.gitignore` Configuration

Our `.gitignore` is configured to automatically exclude:

```gitignore
# Environment files
.env
.env.local
.env*.local
!.env.example          # Only template is safe

# Firebase keys
*.service-account.json
.service-account-keys.json

# Build folders
.next/
node_modules/
out/

# IDE
.idea/
.vscode/
.DS_Store
```

### 2. Environment Variable Template

`.env.example` is safe to commit because it only contains:
- Placeholder values
- Documentation
- Variable names (not actual keys)

Example:
```env
# SAFE - This is just a template
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
```

---

## 🚨 What NOT to Commit

### ❌ NEVER Commit These:

```bash
# Real API keys
OPENROUTER_API_KEY=sk-or-v1-actual_key_here

# Real Firebase credentials
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyActualKeyHere

# Service account private keys
{
  "type": "service_account",
  "private_key": "-----BEGIN PRIVATE KEY-----\nactual_key\n...",
  "client_email": "firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com"
}
```

### ✅ SAFE to Commit:

```bash
# Template files
.env.example

# Source code
src/
components/
hooks/
lib/

# Configuration files (without secrets)
next.config.js
tailwind.config.ts
tsconfig.json
package.json
```

---

## 🔍 Security Checklist Before Pushing

### Before `git push`, always verify:

```bash
# 1. Check what files will be committed
git status

# 2. Review staged changes
git diff --cached

# 3. Verify no .env files are included
git ls-files | grep -E "\.env|\.local"

# 4. Check for accidental secrets
git grep -i "api_key\|apikey\|secret\|password" -- "*.ts" "*.tsx" "*.js" "*.json"
```

### Expected Output:

✅ **GOOD** - Only template files:
```
.env.example
```

❌ **BAD** - Actual environment files:
```
.env.local          ← REMOVE THIS!
.env                ← REMOVE THIS!
```

---

## 🛡️ Security Measures Implemented

### 1. Environment Variables
- ✅ All API keys stored in environment variables
- ✅ `.env` files excluded from Git
- ✅ Template provided in `.env.example`

### 2. Firebase Security
- ✅ Firestore security rules enforce user-specific access
- ✅ Service account keys never committed
- ✅ Authentication required for all protected routes

### 3. API Protection
- ✅ Rate limiting on `/api/chat` endpoint
- ✅ Server-side API key validation
- ✅ User usage tracking and limits

### 4. Access Control
- ✅ Admin routes protected by authentication check
- ✅ User can only access their own chat history
- ✅ Tier-based usage limits enforced

### 5. Build Security
- ✅ `.next/` folder excluded (contains build artifacts)
- ✅ `node_modules/` excluded (contains dependencies)
- ✅ Source maps not generated in production

---

## 🔧 How to Remove Accidentally Committed Secrets

### If you accidentally committed sensitive files:

#### Step 1: Remove from Git history
```bash
# Remove the file from Git (but keep it locally)
git rm --cached .env.local
git rm --cached .env

# Commit the removal
git commit -m "Remove sensitive environment files"
```

#### Step 2: Add to .gitignore (if not already)
```bash
# Make sure .gitignore includes:
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Update .gitignore for environment files"
```

#### Step 3: Rotate compromised keys
```bash
# If API keys were exposed:
# 1. Revoke the old keys immediately
# 2. Generate new keys
# 3. Update .env.local with new keys
# 4. Never commit the new keys!
```

#### Step 4: Force push (if already pushed to GitHub)
```bash
# WARNING: This rewrites Git history!
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch -r .env*' \
  --prune-empty --tag-name-filter cat -- --all

git push --force --all
```

---

## 📋 Best Practices

### 1. Local Development
```bash
# Always use .env.local for development
cp .env.example .env.local
# Edit .env.local with real keys
# NEVER commit .env.local
```

### 2. Production Deployment
```bash
# Add environment variables in Vercel dashboard
# NOT in .env files
Vercel → Settings → Environment Variables
```

### 3. Team Collaboration
```bash
# Share .env.example template
# Each team member creates their own .env.local
# Never share actual API keys via Git/Email
```

### 4. CI/CD Pipeline
```yaml
# Use secrets management in CI/CD
# GitHub Actions: Use repository secrets
# Vercel: Use environment variables
# Never hardcode keys in workflow files
```

---

## 🔐 Firebase Security Rules

Our Firestore rules ensure:

```javascript
// Users can only access their own chats
match /chats/{chatId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}

// Messages are accessible to authenticated users
match /messages/{messageId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
}

// User usage is private (owner or admin only)
match /user_usage/{userId} {
  allow read: if request.auth.uid == userId || isAdmin();
}

// Admin config requires admin privileges
match /config/admin {
  allow read: if request.auth != null;
  allow write: if isAdmin();
}
```

---

## 🚨 Security Incident Response

### If you suspect a security breach:

1. **Rotate all API keys immediately**
   - OpenRouter: https://openrouter.ai/keys
   - Firebase: https://console.firebase.google.com/

2. **Review access logs**
   - Firebase Console → Authentication → Users
   - OpenRouter → Activity

3. **Check for unauthorized deployments**
   - Vercel → Project → Deployments
   - Review recent commits

4. **Update all passwords**
   - GitHub account
   - Vercel account
   - Firebase account

5. **Enable 2FA everywhere**
   - GitHub Settings → Password and authentication
   - Vercel Account → Security
   - Google Account → Security

---

## 📚 Resources

- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Vercel Security Best Practices](https://vercel.com/security)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## ✅ Pre-Commit Checklist

Before every commit, verify:

- [ ] No `.env` or `.env.local` files staged
- [ ] No API keys in source code
- [ ] No Firebase service account keys committed
- [ ] `.gitignore` is up to date
- [ ] Reviewed all changes with `git diff`
- [ ] Only necessary files are included

---

**Security is everyone's responsibility!**

If you find a security vulnerability, please report it responsibly:
- Do not disclose publicly until fixed
- Contact the maintainers privately
- Allow reasonable time for patching

---

**Last Updated:** March 19, 2026
**Version:** 1.0.0
