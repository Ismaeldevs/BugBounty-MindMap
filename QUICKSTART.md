# Bug Bounty MindMap Platform - Quick Start Guide

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

## 🚀 Quick Start

### Windows

1. **Setup Database**
   ```bash
   # Create database in PostgreSQL
   createdb bugbounty_db
   ```

2. **Configure Environment**
   ```bash
   # Backend
   cd backend
   copy .env.example .env
   # Edit .env with your database credentials

   # Frontend
   cd frontend
   copy .env.example .env
   ```

3. **Run Application**
   ```bash
   # From project root
   start.bat
   ```

### Linux/Mac

1. **Setup Database**
   ```bash
   createdb bugbounty_db
   ```

2. **Configure Environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials

   # Frontend
   cd frontend
   cp .env.example .env
   ```

3. **Run Application**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

## 📱 Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/v1/docs

## 🔑 Default Credentials

For development, a default admin user is created:
- **Email**: admin@bugbounty.local
- **Password**: admin123

**⚠️ Change these credentials in production!**

## 🛠️ Manual Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
createdb bugbounty_db

# Configure environment
cp .env.example .env
# Edit .env file

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

## 📊 Database Configuration

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/bugbounty_db
SECRET_KEY=your-super-secret-key-min-32-characters
```

## ✨ Features

### ✅ Implemented

- User Authentication (JWT)
- Project Management (CRUD)
- Interactive MindMaps with ReactFlow
- Drag & Drop nodes
- Custom node types and statuses
- Export/Import projects
- Rich metadata support
- Color-coded node statuses
- Node connections

### 🚧 Coming Soon

- Tool integration (subfinder, httpx, nuclei)
- Real-time collaboration
- Report generation
- Advanced search and filters

## 📚 Usage

1. **Register/Login**
   - Create account at `/register`
   - Login at `/login`

2. **Create Project**
   - Click "New Project" on dashboard
   - Fill in program details

3. **Build MindMap**
   - Open project
   - Click "Open MindMap"
   - Add nodes with "+"
   - Drag to position
   - Connect related nodes
   - Click nodes to edit details

4. **Export Data**
   - Click "Export" on project view
   - Download JSON file

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Create database if not exists
createdb bugbounty_db
```

### Port Already in Use
```bash
# Backend (8000)
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -i :8000

# Frontend (3000)
# Change port in vite.config.js
```

### Migration Errors
```bash
cd backend
alembic downgrade -1
alembic upgrade head
```

## 📝 Development

### Create Database Migration
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Build for Production
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm run build
# Output in dist/
```

## 🎯 Project Structure

```
Bug-Bounty-Project/
├── backend/          # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── core/     # Config & security
│   └── alembic/      # Migrations
└── frontend/         # React + Vite
    └── src/
        ├── components/
        ├── pages/
        ├── store/    # Zustand state
        └── services/ # API client
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT authentication
- SQL injection prevention
- CORS configured
- Input validation
- XSS protection

## 📄 License

MIT License

## 💬 Support

For issues and questions, please check:
- API Docs: http://localhost:8000/api/v1/docs
- Project README: /README.md
