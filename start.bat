@echo off
setlocal
cd /d "%~dp0"

title Web App Tao Ma Tran va De Kiem Tra

echo ========================================================
echo   KHOI DONG WEB APP TAO MA TRAN VA DE KIEM TRA
echo ========================================================
echo.

if not exist "%~dp0package.json" (
    echo [LOI] Khong tim thay package.json tai: %~dp0
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Node.js tren he thong!
    echo Vui long cai dat Node.js tai https://nodejs.org
    pause
    exit /b 1
)

if not exist "%~dp0node_modules" (
    echo [THONG BAO] Dang cai dat thu vien npm...
    call npm install
)

echo [THONG BAO] Dang khoi dong may chu Next.js...
echo [THONG BAO] May chu se chay tai: http://localhost:3000
echo Nhan Ctrl + C neu muon dung may chu.
echo.

start "" http://localhost:3000

call npm run dev

pause
