@echo off
echo Starting Beltagy To-Do Local Server...
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Trying 'py'...
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Python is not installed or not in PATH.
        echo Please install Python from https://www.python.org/downloads/
        echo or use a VS Code extension like "Live Server".
        echo.
        pause
        exit /b
    ) else (
        set PYTHON_CMD=py
    )
) else (
    set PYTHON_CMD=python
)

echo Found Python! Starting server at http://localhost:8000
echo You can close this window to stop the server.
echo.

start "" "http://localhost:8000"
%PYTHON_CMD% -m http.server 8000
