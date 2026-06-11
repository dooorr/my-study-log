@echo off
:: Right-click this file -> Run as administrator
cd /d "%~dp0"
title Firewall rule for port 8080

netsh advfirewall firewall delete rule name="KaoyanStudy8080" >nul 2>&1
netsh advfirewall firewall add rule name="KaoyanStudy8080" dir=in action=allow protocol=TCP localport=8080 profile=private,public

if %errorlevel% neq 0 (
  echo FAILED. Right-click this bat and choose Run as administrator.
) else (
  echo OK: port 8080 allowed.
  echo Now run: start-server.bat
  echo iPhone hotspot URL is usually http://172.20.10.x:8080
)
echo.
pause
