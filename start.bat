@echo off
echo ================================================
echo   BugReportEase - Smart Bug Report Generator
echo   Created by Rajveer Singh
echo ================================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed: 
node --version
echo.

echo [2/3] Installing dependencies...
if not exist "node_modules" (
    echo Installing packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)
echo.

echo [3/3] Starting BugReportEase server...
echo.
echo ================================================
echo   Server will start on: http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ================================================
echo.

call npm start
