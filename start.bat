@echo off
title "Whimsical Pantry Server & Real-time Logger"
echo ========================================================
echo   Launching Whimsical Pantry Tracker with Backend Logs
echo ========================================================
echo.
powershell.exe -ExecutionPolicy Bypass -NoExit -File "server.ps1"
pause
