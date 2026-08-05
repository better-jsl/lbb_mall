@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-local.ps1"
if errorlevel 1 (
  echo.
  echo Local services failed to start.
  pause
  exit /b 1
)

echo.
echo Backend: http://127.0.0.1:8080
echo Admin:   http://127.0.0.1:5173
pause
