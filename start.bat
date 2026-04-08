@echo off
echo 🚀 Starting Bug Bounty MindMap Platform...
echo.

REM Start Backend
echo 🔧 Starting Backend...
cd backend

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -q -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found. Copying from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env with your database credentials
    pause
    exit /b 1
)

REM Run migrations
echo 🗄️  Running database migrations...
alembic upgrade head

REM Start backend server in new window
echo ✅ Starting FastAPI server on http://localhost:8000
start "Backend Server" cmd /k "venv\Scripts\activate.bat && uvicorn app.main:app --reload"

cd ..

REM Start Frontend
echo 🎨 Starting Frontend...
cd frontend

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing Node dependencies...
    call npm install
)

REM Check if .env exists
if not exist ".env" (
    echo 📝 Creating frontend .env file...
    copy .env.example .env
)

REM Start frontend server in new window
echo ✅ Starting React app on http://localhost:3000
start "Frontend Server" cmd /k "npm run dev"

cd ..

echo.
echo ✨ Application is running!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/api/v1/docs
echo.
echo Close the server windows to stop the application
pause
