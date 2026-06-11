@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Kaoyan Study Server

echo.
echo ========================================
echo   Phone: open Safari, type the URL below
echo ========================================
echo.

where py >nul 2>&1
if %errorlevel%==0 (
  set PY=py
) else (
  where python >nul 2>&1
  if %errorlevel%==0 (
    set PY=python
  ) else (
    echo ERROR: Python not found.
    echo Use index.html on PC only, or install Python.
    echo.
    pause
    exit /b 1
  )
)

echo PC test:  http://127.0.0.1:8080
echo.
echo iPhone try these URLs on same WiFi:
set FOUND=0
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "ADDR=%%a"
  set "ADDR=!ADDR: =!"
  echo !ADDR! | findstr /r "^127\." >nul
  if !errorlevel! neq 0 (
    echo !ADDR! | findstr /r "^198\.18\." >nul
    if !errorlevel! neq 0 (
      echo   http://!ADDR!:8080
      set FOUND=1
    )
  )
)
if !FOUND!==0 echo   no LAN IP found - check WiFi
echo.
echo Tips: quit VPN first. Keep this window open.
echo Ctrl+C to stop.
echo ========================================
echo.

%PY% -m http.server 8080 --bind 0.0.0.0

pause
