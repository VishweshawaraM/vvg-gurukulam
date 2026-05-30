@echo off
title Veda Vijnana Gurukulam Edu-Sys Server
color 06
echo =============================================================
echo   Veda Vijnana Gurukulam Management System
echo   Initializing Server...
echo =============================================================
echo.

:: Try different paths for Node.js
SET "NODE_PATH="

IF EXIST "C:\Program Files\nodejs\node.exe" SET "NODE_PATH=C:\Program Files\nodejs\node.exe"
IF EXIST "C:\nvm\current\node.exe" SET "NODE_PATH=C:\nvm\current\node.exe"
IF EXIST "%APPDATA%\nvm\default\node.exe" SET "NODE_PATH=%APPDATA%\nvm\default\node.exe"
IF EXIST "%LOCALAPPDATA%\nvs\default\node.exe" SET "NODE_PATH=%LOCALAPPDATA%\nvs\default\node.exe"

IF "%NODE_PATH%"=="" (
  :: Try PATH
  WHERE node >nul 2>&1
  IF %ERRORLEVEL%==0 (
    SET "NODE_PATH=node"
  ) ELSE (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
  )
)

echo Node.js found. Starting server...
echo Open your browser at: http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.

"%NODE_PATH%" server.js

pause
