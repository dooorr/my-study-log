@echo off
setlocal
cd /d "%~dp0"
title Kaoyan - public link for phone

where py >nul 2>&1
if %errorlevel%==0 (set PY=py) else (set PY=python)

where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
  echo cloudflared not installed.
  echo.
  echo Install once in PowerShell:
  echo   winget install Cloudflare.cloudflared
  echo.
  echo Or download: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
  echo Then run this bat again.
  echo.
  pause
  exit /b 1
)

echo.
echo [1] Starting local server on port 8080 ...
start "kaoyan-server" /min cmd /c "%PY% -m http.server 8080 --bind 127.0.0.1 & pause"

timeout /t 2 /nobreak >nul

echo [2] Creating public HTTPS link ...
echo.
echo Copy the https://....trycloudflare.com URL below.
echo WeChat - File Transfer - paste to yourself - open on iPhone Safari.
echo.
echo Keep THIS window open. Close = link dies.
echo ========================================
echo.

cloudflared tunnel --url http://127.0.0.1:8080

echo.
echo Server stopped.
pause
