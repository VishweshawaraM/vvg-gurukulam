$file = 'C:\Users\vevis\OneDrive\Desktop\VVGurukulam Edu-sys\app\database.js'
$content = Get-Content $file -Raw
$content = $content -replace ", hostelRoom: '[^']*'", ""
Set-Content $file $content -Encoding UTF8
Write-Host "hostelRoom removed from all student records"
