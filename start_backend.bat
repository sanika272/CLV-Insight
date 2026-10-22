@echo off
echo ===============================================
echo   CLV Insight - Starting Backend Server
echo ===============================================
cd /d "%~dp0backend"
call venv\Scripts\activate
echo Starting FastAPI server on http://localhost:8000 ...
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
