@echo off
title VVG — Upload to GitHub
echo.
echo ====================================================
echo   Veda Vijnana Gurukulam — Upload Latest Changes
echo ====================================================
echo.

cd /d "C:\Users\vevis\OneDrive\Desktop\VVGurukulam Edu-sys"

:: Check git remote
git remote -v 2>nul | findstr /i "origin" >nul
if errorlevel 1 (
  echo.
  echo  Step 1: No GitHub connection found.
  echo  Please enter your GitHub username:
  set /p GH_USER=  GitHub username: 
  echo.
  echo  Creating connection to GitHub...
  git remote add origin https://github.com/%GH_USER%/vvg-gurukulam.git
  echo  Connected!
)

echo.
echo  Saving all changes...
git add -A
git commit -m "VVG update %date% %time%"

echo.
echo  Uploading to GitHub...
git push origin master

echo.
echo ====================================================
echo   Upload complete! Your changes are on GitHub.
echo ====================================================
echo.
pause
