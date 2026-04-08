#!/bin/bash

echo "🚀 Starting Bug Bounty MindMap Platform..."

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Start Backend
echo "🔧 Starting Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -q -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
    exit 1
fi

# Run migrations
echo "🗄️  Running database migrations..."
alembic upgrade head

# Start backend server
echo "✅ Starting FastAPI server on http://localhost:8000"
uvicorn app.main:app --reload &
BACKEND_PID=$!

cd ..

# Start Frontend
echo "🎨 Starting Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
fi

# Start frontend server
echo "✅ Starting React app on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✨ Application is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/api/v1/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
wait
