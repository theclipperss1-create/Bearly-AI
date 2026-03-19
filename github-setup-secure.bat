@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   AI Chatbot - GitHub Setup Script
echo   Secure Version (No API Keys!)
echo ========================================
echo.

REM Color codes
set "GREEN=[OK]"
set "YELLOW=[WARN]"
set "RED=[ERROR]"

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED% Git is not installed!
    echo Please install from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo %GREEN% Git is installed!
echo.

REM ========================================
REM SECURITY CHECK - Ensure .env files are ignored
REM ========================================
echo ========================================
echo   SECURITY CHECK
echo ========================================
echo.

echo Checking for sensitive files...
echo.

REM Check if .env.local exists and warn
if exist ".env.local" (
    echo %YELLOW% Found .env.local (This is GOOD - it should NOT be committed)
    echo   Making sure it's in .gitignore...
    findstr /C:".env.local" .gitignore >nul 2>nul
    if errorlevel 1 (
        echo %RED% WARNING: .env.local is NOT in .gitignore!
        echo   Adding it now...
        echo .env.local >> .gitignore
    ) else (
        echo %GREEN% .env.local is properly ignored
    )
    echo.
)

REM Check if .gitignore exists
if not exist ".gitignore" (
    echo %RED% .gitignore not found!
    echo Creating secure .gitignore...
    (
        echo # Dependencies
        echo /node_modules
        echo /.pnp
        echo .pnp.js
        echo.
        echo # Environment files (PRIVATE!)
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo .env*.local
        echo !.env.example
        echo.
        echo # Next.js
        echo /.next/
        echo /out/
        echo next-env.d.ts
        echo *.tsbuildinfo
        echo.
        echo # IDE
        echo .idea/
        echo .vscode/
        echo *.swp
        echo *.swo
        echo.
        echo # System
        echo .DS_Store
        echo *.pem
        echo *.log
    ) > .gitignore
    echo %GREEN% .gitignore created
    echo.
) else (
    echo %GREEN% .gitignore exists
    echo.
)

REM ========================================
REM GIT INITIALIZATION
REM ========================================
echo ========================================
echo   GIT INITIALIZATION
echo ========================================
echo.

if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo %GREEN% Git repository initialized
    echo.
) else (
    echo %GREEN% Git repository already initialized
    echo.
)

REM ========================================
REM GIT CONFIGURATION
REM ========================================
echo ========================================
echo   GIT CONFIGURATION
echo ========================================
echo.

REM Check if user.name is set
git config user.name >nul 2>nul
if errorlevel 1 (
    set /p GIT_NAME="Enter your Git username: "
    git config user.name "!GIT_NAME!"
    echo %GREEN% Git username set: !GIT_NAME!
    echo.
) else (
    for /f "delims=" %%i in ('git config user.name') do set GIT_NAME=%%i
    echo %GREEN% Git username: !GIT_NAME!
    echo.
)

REM Check if user.email is set
git config user.email >nul 2>nul
if errorlevel 1 (
    set /p GIT_EMAIL="Enter your Git email: "
    git config user.email "!GIT_EMAIL!"
    echo %GREEN% Git email set: !GIT_EMAIL!
    echo.
) else (
    for /f "delims=" %%i in ('git config user.email') do set GIT_EMAIL=%%i
    echo %GREEN% Git email: !GIT_EMAIL!
    echo.
)

REM ========================================
REM ADD FILES
REM ========================================
echo ========================================
echo   ADDING FILES TO GIT
echo ========================================
echo.

echo Adding all files...
git add .
echo %GREEN% Files added
echo.

REM Show what will be committed
echo Files to be committed:
git status --short
echo.

REM ========================================
REM CREATE INITIAL COMMIT
REM ========================================
echo ========================================
echo   CREATING INITIAL COMMIT
echo ========================================
echo.

git commit -m "Initial commit: AI Chatbot Bearly - Production Ready"
echo %GREEN% Commit created
echo.

REM ========================================
REM REMOTE REPOSITORY SETUP
REM ========================================
echo ========================================
echo   GITHUB REPOSITORY SETUP
echo ========================================
echo.

REM Check if remote already exists
git remote -v | findstr origin >nul 2>nul
if errorlevel 1 (
    echo %YELLOW% No GitHub remote configured yet
    echo.
    echo Please create a GitHub repository:
    echo.
    echo   1. Go to: https://github.com/new
    echo   2. Repository name: ai-chatbot-bearly
    echo   3. Choose: Public or Private
    echo   4. Click "Create repository"
    echo.
    
    set /p CREATE_REPO="Have you created the GitHub repository? (y/n): "
    if /i "!CREATE_REPO!"=="y" (
        echo.
        set /p GITHUB_USERNAME="Enter your GitHub username: "
        set /p REPO_NAME="Enter repository name (default: ai-chatbot-bearly): "
        if "!REPO_NAME!"=="" set REPO_NAME=ai-chatbot-bearly
        
        echo.
        echo Adding remote repository...
        git remote add origin https://github.com/!GITHUB_USERNAME!/!REPO_NAME!.git
        echo %GREEN% Remote added: https://github.com/!GITHUB_USERNAME!/!REPO_NAME!.git
        echo.
        
        REM Rename branch to main
        git branch -M main
        echo %GREEN% Branch renamed to 'main'
        echo.
        
        REM Push to GitHub
        echo Pushing to GitHub...
        echo This may take a few minutes...
        echo.
        git push -u origin main
        
        if errorlevel 0 (
            echo.
            echo ========================================
            echo   SUCCESS!
            echo ========================================
            echo.
            echo %GREEN% Your code is now on GitHub!
            echo.
            echo Repository URL: https://github.com/!GITHUB_USERNAME!/!REPO_NAME!
            echo.
            echo Next steps:
            echo   1. Go to https://vercel.com
            echo   2. Click "Add New Project"
            echo   3. Import your GitHub repository
            echo   4. Add environment variables in Vercel
            echo   5. Deploy!
            echo.
            echo See README_DEPLOYMENT.md for detailed guide
            echo.
        ) else (
            echo.
            echo %RED% Push failed! Please check:
            echo   - GitHub credentials
            echo   - Repository permissions
            echo   - Internet connection
            echo.
        )
    ) else (
        echo.
        echo %YELLOW% Please create GitHub repository when ready
        echo Your code is staged and ready to commit locally
        echo.
        echo To push later:
        echo   git remote add origin https://github.com/USERNAME/REPO.git
        echo   git branch -M main
        echo   git push -u origin main
        echo.
    )
) else (
    echo %GREEN% Remote repository already configured
    echo.
    
    for /f "tokens=2" %%i in ('git remote get-url origin') do set REMOTE_URL=%%i
    
    echo Pushing changes to GitHub...
    git add .
    git commit -m "Update: Production ready - %DATE%"
    git push
    
    if errorlevel 0 (
        echo.
        echo %GREEN% Code pushed successfully!
        echo.
        echo Repository: !REMOTE_URL!
        echo.
    ) else (
        echo.
        echo %RED% Push failed! Please check your connection
        echo.
    )
)

echo ========================================
echo   SECURITY REMINDER
echo ========================================
echo.
echo %GREEN% The following files are NOT committed (private):
echo   - .env.local (API keys)
echo   - .env (API keys)
echo   - node_modules/
echo   - .next/
echo.
echo You will need to add environment variables in Vercel manually
echo.
echo See .env.example for template
echo.

pause
