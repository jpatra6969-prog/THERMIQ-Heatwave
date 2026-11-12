@echo off
title HEATGUARD X - 1-Click Launcher
color 0b
echo ========================================================
echo       HEATGUARD X - PREDICTIVE HEAT PROTECTION
echo ========================================================
echo.
echo Starting FastAPI Backend (Port 8000)...
start "HeatGuard Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Next.js Frontend (Port 3000)...
start "HeatGuard Frontend" cmd /k "cd frontend && npm run start -- -p 3000"

timeout /t 3 /nobreak >nul

echo Opening HEATGUARD X Dashboard in your browser...
start http://localhost:3000

echo.
echo ========================================================
echo  All services are running!
echo  - Website:  http://localhost:3000
echo  - API Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause

