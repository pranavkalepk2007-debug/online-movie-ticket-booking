@echo off
setlocal
cd /d "%~dp0"
title Movie Ticket Booking Platform

set MODELENCE_PORT=3000
set MODELENCE_TRACKING_ENABLED=false

echo ========================================================
echo   Movie Ticket Booking Platform - Modelence
echo   Backend, Database and Frontend Server
echo ========================================================
echo.
echo [1/3] Initializing working directory: %~dp0
echo [2/3] Starting Database, Backend, and Frontend...
echo [3/3] Application will be available at: http://localhost:3000
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Application stopped with exit code %ERRORLEVEL%.
)
pause
