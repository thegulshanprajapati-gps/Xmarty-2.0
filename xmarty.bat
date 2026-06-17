@echo off
setlocal enabledelayedexpansion

title XMART CREATOR HACKER SYSTEM
color 0A
mode con: cols=100 lines=30

:: Root Path Fix
set "ROOT=%~dp0"

cls
echo.
echo ================================================================
echo              XMART CREATOR v2.0 INITIALIZING
echo ================================================================
echo.

echo [ACCESS] Connecting to secure environment...
timeout /t 1 >nul

echo [DATABASE] Mongo Node Verification...
timeout /t 1 >nul

echo [SYSTEM] Multi-domain boot sequence...
timeout /t 1 >nul

echo.
echo Initializing System...

:: Spinner Animation
for %%A in (\ ^| / -) do (
    <nul set /p "=Loading [%%A]..."
    timeout /t 1 >nul
    cls
)

echo.
echo [OK] SYSTEM READY
timeout /t 1 >nul

:: ==========================
:: MAIN DOMAIN
:: ==========================
start "MAIN DOMAIN" cmd /k ^
"color 0A && title MAIN DOMAIN && cd /d ""%ROOT%"" && echo ========================== && echo MAIN DOMAIN ACTIVE && echo ========================== && npm run build && npm run start"

timeout /t 2 >nul

:: ==========================
:: SUPPORT DOMAIN
:: ==========================
start "SUPPORT DOMAIN" cmd /k ^
"color 0A && title SUPPORT DOMAIN && cd /d ""%ROOT%supportdomain"" && echo ========================== && echo SUPPORT DOMAIN ACTIVE && echo ========================== && npm run build && npm run start"

timeout /t 2 >nul

:: ==========================
:: INSTRUCTOR DOMAIN
:: ==========================
start "INSTRUCTOR DOMAIN" cmd /k ^
"color 0A && title INSTRUCTOR DOMAIN && cd /d ""%ROOT%instructordomain"" && echo ========================== && echo INSTRUCTOR DOMAIN ACTIVE && echo ========================== && npm run build && npm run start"

echo.
echo ================================================================
echo       ALL 3 TERMINALS SUCCESSFULLY OPENED
echo ================================================================

pause