@echo off
cd /d "C:\Users\vevis\OneDrive\Desktop\VVGurukulam Edu-sys"
git config user.email "vvg@gurukulam.org"
git config user.name "VVG Admin"
git add -A
git commit -m "VVG Edu-Sys v3.0 - All modules live"
echo.
echo Git setup complete!
git log --oneline -3
pause
