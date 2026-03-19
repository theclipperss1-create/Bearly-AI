@echo off
REM ==================================
REM AI Chatbot - Git Setup Script
REM ==================================

echo ==================================
echo  AI Chatbot - Git Setup
echo ==================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from: https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
git init
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to initialize Git
    pause
    exit /b 1
)

echo.
echo [2/5] Adding all files...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to add files
    pause
    exit /b 1
)

echo.
echo [3/5] Creating initial commit...
git commit -m "Initial commit: AI Chatbot Bearly"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create commit
    pause
    exit /b 1
)

echo.
echo [4/5] Renaming branch to main...
git branch -M main
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to rename branch
    pause
    exit /b 1
)

echo.
echo ==================================
echo  Git Setup Complete!
echo ==================================
echo.
echo NEXT STEPS:
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Repository name: ai-chatbot-bearly
echo.
echo 3. Run these commands (replace YOUR_USERNAME):
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot-bearly.git
echo    git push -u origin main
echo.
echo 4. Then deploy to Vercel:
echo    https://vercel.com
echo.
echo ==================================
pause
