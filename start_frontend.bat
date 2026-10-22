@echo off
echo ===============================================
echo   CLV Insight - Starting Frontend (Dev)
echo ===============================================
cd /d "%~dp0frontend"
echo Starting Vite dev server on http://localhost:5173 ...
npm run dev
