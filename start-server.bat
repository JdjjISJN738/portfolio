@echo off
echo Starting Portfolio Server...
cd /d "%~dp0"

:: Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

:: Start the server and open browser
start http://localhost:3000
node server.js

echo.
echo If the browser doesn't open automatically, please visit: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server...
