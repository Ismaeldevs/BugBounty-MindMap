# Backend README

## Bug Bounty MindMap Platform - Backend

FastAPI backend for the Bug Bounty MindMap Platform.

### 🚀 Quick Start

1. **Install PostgreSQL** (if not already installed)

2. **Create a database**:
```bash
createdb bugbounty_db
```

3. **Install Python dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

4. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your database credentials and secret key
```

5. **Run database migrations**:
```bash
alembic upgrade head
```

6. **Start the server**:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/api/v1/docs`
- Alternative Docs: `http://localhost:8000/api/v1/redoc`

### 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── projects.py      # Project CRUD
│   │   │   └── nodes.py         # MindMap nodes CRUD
│   │   └── dependencies.py      # Auth dependencies
│   ├── core/
│   │   ├── config.py            # Configuration
│   │   └── security.py          # JWT & password hashing
│   ├── database/
│   │   ├── session.py           # Database connection
│   │   └── init_db.py           # Database initialization
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── project.py           # Project model
│   │   └── mindmap_node.py      # MindMap node model
│   ├── schemas/
│   │   ├── user.py              # User schemas
│   │   ├── project.py           # Project schemas
│   │   └── mindmap_node.py      # Node schemas
│   └── main.py                  # FastAPI application
├── alembic/                     # Database migrations
├── requirements.txt
└── .env.example
```

### 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1. Register: `POST /api/v1/auth/register`
2. Login: `POST /api/v1/auth/login`
3. Use the token in the `Authorization: Bearer <token>` header

### 📊 Database Models

- **User**: Authentication and user management
- **Project**: Bug Bounty programs/projects
- **MindMapNode**: Interactive mindmap nodes with rich metadata

### 🛠️ Development

**Create a new migration**:
```bash
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

**Run tests** (coming soon):
```bash
pytest
```

### 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection protection (SQLAlchemy ORM)
- CORS configuration
- Input validation with Pydantic
- Secure password requirements

### 📝 API Endpoints

**Authentication**:
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

**Projects**:
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/{id}` - Get project with nodes
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project
- `GET /api/v1/projects/{id}/export` - Export project

**MindMap Nodes**:
- `POST /api/v1/projects/{id}/nodes` - Create node
- `POST /api/v1/projects/{id}/nodes/bulk` - Bulk create nodes
- `GET /api/v1/projects/{id}/nodes` - List nodes
- `GET /api/v1/projects/{id}/nodes/{node_id}` - Get node
- `PUT /api/v1/projects/{id}/nodes/{node_id}` - Update node
- `DELETE /api/v1/projects/{id}/nodes/{node_id}` - Delete node
