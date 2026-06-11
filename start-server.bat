@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Kaoyan Study Server

where py >nul 2>&1
if %errorlevel%==0 (set PY=py) else (set PY=python)

echo.
echo ========================================
echo   iPhone Safari - type URL below
echo ========================================
echo.
echo PC test first:  http://127.0.0.1:8080
echo   ^(if this fails on PC, server not running^)
echo.
echo iPhone URLs:
set FOUND=0
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "ADDR=%%a"
  set "ADDR=!ADDR: =!"
  echo !ADDR! | findstr /r "^127\." >nul
  if !errorlevel! neq 0 (
    echo !ADDR! | findstr /r "^198\.18\." >nul
    if !errorlevel! neq 0 (
      echo !ADDR! | findstr /r "^172\.20\.10\." >nul
      if !errorlevel! equ 0 (
        echo   http://!ADDR!:8080  ^<-- iPhone hotspot: try this first
      ) else (
        echo   http://!ADDR!:8080
      )
      set FOUND=1
    )
  )
)
if !FOUND!==0 echo   no IP found
echo.
echo If phone still fails: run firewall bat as Admin, then retry.
echo Keep window open. Ctrl+C to stop.
echo ========================================
echo.

%PY% -m http.server 8080 --bind 0.0.0.0

pause
