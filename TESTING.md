# 🧪 Testing & Verification Guide

## Quick Verification Checklist

### ✅ 1. Verify Backend Setup

```bash
cd backend

# Check Python version
python --version  # Should be 3.10+

# Check PostgreSQL
pg_isready

# Create database
createdb bugbounty_db

# Setup virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/bugbounty_db
# SECRET_KEY=your-super-secret-key-change-this-min-32-chars

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Test Backend:**
- Open browser: http://localhost:8000
- Should see: `{"message": "Bug Bounty MindMap Platform API", ...}`
- API Docs: http://localhost:8000/api/v1/docs

### ✅ 2. Verify Frontend Setup

```bash
cd frontend

# Check Node version
node --version  # Should be 18+

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Test Frontend:**
- Open browser: http://localhost:3000
- Should see: Login page with Bug Bounty MindMap logo

### ✅ 3. Test Authentication Flow

1. **Register New User**
   ```
   URL: http://localhost:3000/register
   
   Test Data:
   - Email: test@example.com
   - Username: testuser
   - Password: TestPass123
   - Confirm Password: TestPass123
   
   Expected: Success message → redirect to login
   ```

2. **Login**
   ```
   URL: http://localhost:3000/login
   
   Credentials:
   - Email: test@example.com
   - Password: TestPass123
   
   Expected: Redirect to dashboard
   ```

3. **Verify Token**
   - Open DevTools → Application → Local Storage
   - Should see: `token` and `auth-storage` keys
   - Token should be a JWT string

### ✅ 4. Test Project Management

1. **Create Project**
   ```
   Click "New Project"
   
   Fill form:
   - Name: Test Bug Bounty Program
   - Description: Testing the platform
   - Scope: *.example.com, api.example.com
   - Program URL: https://hackerone.com/test
   - Tags: web, api, test
   
   Expected: Project card appears in dashboard
   ```

2. **View Project**
   ```
   Click on project card
   
   Expected: See project details page
   ```

3. **Edit Project**
   ```
   Click "Edit" button
   Change name to: "Updated Test Program"
   
   Expected: Success toast, name updated
   ```

### ✅ 5. Test MindMap & Drag & Drop

1. **Open MindMap**
   ```
   From project detail → Click "Open MindMap"
   
   Expected: ReactFlow canvas with controls
   ```

2. **Add Node**
   ```
   Click "+" button
   
   Fill form:
   - Label: api.example.com
   - Type: Subdomain
   - Status: Reconnaissance
   - Notes: Found during recon
   - Tags: api, high-priority
   
   Click "Add Node"
   
   Expected: Node appears on canvas
   ```

3. **Test Drag & Drop** ⭐
   ```
   1. Click and hold the node
   2. Drag it to a new position
   3. Release mouse
   
   Expected: 
   - Node moves smoothly
   - Position saved automatically (no save button needed)
   - Check browser console: Should see API call to update position
   ```

4. **Add Multiple Nodes**
   ```
   Add 3-4 more nodes with different types:
   - Root domain
   - IP Address: 192.168.1.1
   - Vulnerability: SQL Injection
   - Technology: nginx
   
   Drag each to different positions
   
   Expected: All nodes draggable and positions saved
   ```

5. **Connect Nodes**
   ```
   1. Hover over a node
   2. Drag from the connection point (handle)
   3. Drop on another node
   
   Expected: Animated edge connecting the nodes
   ```

6. **View Node Details**
   ```
   Click on any node
   
   Expected: Sidebar opens with node details
   ```

7. **Delete Node**
   ```
   In sidebar → Click "Delete Node"
   Confirm deletion
   
   Expected: Node removed from canvas
   ```

### ✅ 6. Test Export Functionality

```
1. Navigate to project view
2. Click "Export" button
3. Expected: JSON file downloads
4. Open file in text editor
5. Verify contains:
   - project data
   - all nodes
   - connections
   - export_date
   - version: "1.0"
```

### ✅ 7. Test API Directly (Optional)

**Using curl or Postman:**

1. **Register**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@test.com",
    "username": "apitest",
    "password": "ApiTest123"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@test.com",
    "password": "ApiTest123"
  }'
```

Save the `access_token` from response.

3. **Create Project**
```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "API Test Project",
    "description": "Testing via API",
    "scope": "*.test.com",
    "tags": ["test", "api"]
  }'
```

4. **Create Node**
```bash
curl -X POST http://localhost:8000/api/v1/projects/1/nodes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "node_id": "node-123",
    "label": "test.example.com",
    "node_type": "subdomain",
    "status": "reconnaissance",
    "position_x": 100.0,
    "position_y": 200.0,
    "color": "#64748b",
    "tags": ["test"],
    "connections": []
  }'
```

5. **Update Node Position (Drag & Drop)**
```bash
curl -X PUT http://localhost:8000/api/v1/projects/1/nodes/node-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "position_x": 300.0,
    "position_y": 400.0
  }'
```

### ✅ 8. Verify Database

```bash
# Connect to PostgreSQL
psql bugbounty_db

# Check tables
\dt

# Expected tables:
- users
- projects
- mindmap_nodes
- alembic_version

# Check users
SELECT id, email, username, is_active FROM users;

# Check projects
SELECT id, name, owner_id, status FROM projects;

# Check nodes
SELECT id, node_id, label, node_type, position_x, position_y FROM mindmap_nodes;

# Exit
\q
```

### ✅ 9. Performance Check

**Drag & Drop Performance:**
```
1. Create 10+ nodes
2. Try dragging multiple nodes quickly
3. Expected: Smooth animations, no lag
```

**API Response Times:**
- Check browser DevTools → Network tab
- Most requests should be < 200ms
- Node position updates should be < 100ms

### ✅ 10. Error Handling Tests

1. **Invalid Login**
   ```
   Try logging in with wrong password
   Expected: Error toast "Incorrect email or password"
   ```

2. **Unauthorized Access**
   ```
   Logout → Try accessing http://localhost:3000/dashboard
   Expected: Redirect to login
   ```

3. **Duplicate Node ID**
   ```
   Try creating node with existing node_id
   Expected: Error message
   ```

4. **Database Connection Lost**
   ```
   Stop PostgreSQL → Try any operation
   Expected: Error toast, not application crash
   ```

## 🐛 Common Issues & Solutions

### Issue: "Connection refused" on port 8000
```bash
# Check if backend is running
# Check if port is already in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Linux/Mac

# Kill process if needed
# Windows: taskkill /PID <PID> /F
# Linux/Mac: kill -9 <PID>
```

### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep bugbounty

# Create if not exists
createdb bugbounty_db

# Check connection string in backend/.env
```

### Issue: "Module not found" errors
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules
npm install
```

### Issue: Drag & Drop not saving position
```bash
# Check browser console for errors
# Verify API call is being made: Network tab
# Check backend logs
# Verify node update endpoint is working

# Test update endpoint directly:
curl -X PUT http://localhost:8000/api/v1/projects/1/nodes/node-123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"position_x": 100, "position_y": 200}'
```

### Issue: Frontend shows blank page
```bash
# Check browser console for errors
# Verify API URL in frontend/.env
# Check CORS settings in backend
# Clear browser cache
# Restart dev server
```

## ✅ Success Criteria

Your implementation is successful if:

- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Can register and login
- [x] Can create, view, edit projects
- [x] Can open MindMap editor
- [x] Can add nodes to MindMap
- [x] **Can drag & drop nodes smoothly**
- [x] **Node positions save automatically**
- [x] Can connect nodes with edges
- [x] Can view node details
- [x] Can delete nodes
- [x] Can export projects
- [x] All API endpoints respond correctly
- [x] No console errors
- [x] Database persists data correctly

## 🎉 If All Tests Pass

Congratulations! Your Bug Bounty MindMap Platform is fully functional!

You now have:
- ✅ Production-ready backend with FastAPI
- ✅ Modern React frontend with Tailwind CSS
- ✅ Complete authentication system
- ✅ Full CRUD operations
- ✅ Interactive MindMaps with Drag & Drop
- ✅ Export/Import functionality
- ✅ Secure and scalable architecture

Ready for deployment! 🚀
