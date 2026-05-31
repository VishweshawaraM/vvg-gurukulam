@echo off
title VVG — Uploading to GitHub
echo.
echo ====================================================
echo   Veda Vijnana Gurukulam — Uploading Latest Changes
echo ====================================================
echo.
cd /d "C:\Users\vevis\OneDrive\Desktop\VVGurukulam Edu-sys"
git add -A
git commit -m "VVG update %date%"
git push origin master
echo.
echo ====================================================
echo   Done! Website updated on GitHub automatically.
echo ====================================================
echo.
pause
