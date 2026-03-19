@echo off
echo ========================================
echo   AI Chatbot - Git Setup Script
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo [INFO] Git is installed!
echo.

REM Initialize git if not already
if not exist ".git" (
    echo [STEP 1] Initializing Git repository...
    git init
    echo.
) else (
    echo [INFO] Git repository already initialized
    echo.
)

REM Create .gitignore if not exists
if not exist ".gitignore" (
    echo [STEP 2] Creating .gitignore...
    (
        echo # dependencies
        echo /node_modules
        echo /.pnp
        echo .pnp.js
        echo.
        echo # testing
        echo /coverage
        echo.
        echo # next.js
        echo /.next/
        echo /out/
        echo.
        echo # production
        echo /build
        echo.
        echo # misc
        echo .DS_Store
        echo *.pem
        echo.
        echo # debug
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # local env files
        echo .env*.local
        echo .env
        echo.
        echo # vercel
        echo .vercel
        echo.
        echo # typescript
        echo *.tsbuildinfo
        echo next-env.d.ts
    ) > .gitignore
    echo [INFO] .gitignore created
    echo.
) else (
    echo [INFO] .gitignore already exists
    echo.
)

REM Add all files
echo [STEP 3] Adding files to Git...
git add .
echo [INFO] Files added successfully
echo.

REM Check if remote exists
git remote -v | findstr origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [STEP 4] No remote repository configured
    echo.
    echo Please create a GitHub repository:
    echo 1. Go to: https://github.com/new
    echo 2. Repository name: ai-chatbot-bearly
    echo 3. Choose Public or Private
    echo 4. Click "Create repository"
    echo.
    echo Then copy the commands from GitHub:
    echo Example:
    echo   git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot-bearly.git
    echo   git branch -M main
    echo   git push -u origin main
    echo.
    set /p CONTINUE="Have you created the GitHub repository? (y/n): "
    if /i "%CONTINUE%"=="y" (
        set /p REMOTE_URL="Enter the GitHub repository URL: "
        git remote add origin %REMOTE_URL%
        echo [INFO] Remote repository added
        echo.
        
        git branch -M main
        echo [INFO] Branch renamed to main
        echo.
        
        git push -u origin main
        echo [INFO] Code pushed to GitHub!
        echo.
    ) else (
        echo [WARNING] Please create GitHub repository manually
        echo Your code is ready locally
        echo.
    )
) else (
    echo [STEP 4] Pushing to GitHub...
    git commit -m "Deployment ready - %DATE%"
    git push
    echo [INFO] Code pushed to GitHub!
    echo.
)

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Go to https://vercel.com
echo 2. Click "Add New Project"
echo 3. Import your GitHub repository
echo 4. Add environment variables
echo 5. Deploy!
echo.
echo See DEPLOYMENT_CHECKLIST.md for detailed guide
echo.
pause
