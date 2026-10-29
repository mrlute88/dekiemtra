@echo off
setlocal
cd /d "%~dp0"

title Web App Tao Ma Tran va De Kiem Tra - GDPT 2018

echo ======================================================================
echo       KHOI DONG WEB APP TAO MA TRAN VA DE KIEM TRA GDPT 2018
echo ======================================================================
echo.

if not exist "%~dp0package.json" (
    echo [LOI] Khong tim thay tep package.json tai: %~dp0
    echo Vui long kiem tra lai thu muc chua ung dung.
    echo.
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Node.js tren may tinh!
    echo Vui long cai dat Node.js tai: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [1/3] Dang kiem tra va giai phong cong 3000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { (Get-NetTCPConnection -LocalPort 3000,3001 -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } } catch {}; exit 0" >nul 2>&1

if not exist "%~dp0node_modules" (
    echo [THONG BAO] Phat hien lan dau su dung, dang cai dat thu vien...
    call npm install
    if errorlevel 1 (
        echo [LOI] Cai dat thu vien that bai.
        pause
        exit /b 1
    )
)

echo [2/3] Dang mo trinh duyet tai http://localhost:3000 ...
start "" http://localhost:3000

echo [3/3] Dang khoi dong may chu tai http://localhost:3000 ...
echo ======================================================================
echo   CHU Y: Khong dong cua so nay trong qua trinh su dung webapp.
echo   De dung may chu, nhan to hop phim Ctrl + C hoac dong cua so nay.
echo ======================================================================
echo.

call npm.cmd run dev -- -p 3000
if errorlevel 1 (
    call npm run dev -- -p 3000
)

if errorlevel 1 (
    echo.
    echo [LOI] May chu gap su co khi khoi dong.
    pause
)
