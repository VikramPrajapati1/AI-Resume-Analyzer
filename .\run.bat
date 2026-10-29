@echo off
echo ========================================================
echo   Starting AI Resume Analyzer & Job Matcher
echo   Backend: FastAPI (Port 8000)
echo   Frontend: React + Tailwind CSS (Mounted at root)
echo ========================================================
echo.

cd /d "%~dp0\backend"
if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
) else (
    "C:\Users\vikra\.gemini\antigravity\scratch\ai-resume-analyzer\backend\.venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
)
pause
