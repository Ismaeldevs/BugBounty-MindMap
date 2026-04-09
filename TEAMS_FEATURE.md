# Teams Feature - Bug Bounty MindMap Platform

## 📋 Overview

The Teams feature allows bug bounty hunters to collaborate on shared projects. Multiple users can work together on the same reconnaissance mind maps, share findings, and coordinate their efforts.

## 🎯 Features

### Team Management
- **Create Teams**: Form collaboration groups with custom names and descriptions
- **Team Roles**: Three-tier permission system
  - **Owner**: Full control, can manage team and members
  - **Admin**: Can add/remove members and manage team settings
  - **Member**: Can view and contribute to team projects

### Member Management
- Add members by email address
- Assign and modify roles (owner only)
- Remove members or leave team
- View member list with roles and join dates

### Project Collaboration
- Create projects under a team for shared access
- All team members can view and edit team projects
- Personal projects remain private
- Filter view: Personal / Team / All projects

## 🚀 Implementation Details

### Backend Components

#### Models (`backend/app/models/team.py`)
- `Team`: Core team entity with name, description, creator
- `TeamMember`: Junction table for user-team relationships
- `TeamRole`: Enum (owner, admin, member)

#### Schemas (`backend/app/schemas/team.py`)
- `TeamCreate`, `TeamUpdate`, `TeamInDB`
- `TeamMemberCreate`, `TeamMemberUpdate`, `TeamMemberInDB`
- `TeamDetailResponse`, `TeamListResponse`

#### API Endpoints (`backend/app/api/routers/teams.py`)

**Team Operations:**
- `POST /api/v1/teams` - Create new team
- `GET /api/v1/teams` - List user's teams
- `GET /api/v1/teams/{id}` - Get team details
- `PUT /api/v1/teams/{id}` - Update team (owner/admin)
- `DELETE /api/v1/teams/{id}` - Delete team (owner only)

**Member Operations:**
- `POST /api/v1/teams/{id}/members` - Add member (owner/admin)
- `GET /api/v1/teams/{id}/members` - List members
- `PUT /api/v1/teams/{id}/members/{user_id}` - Update role (owner)
- `DELETE /api/v1/teams/{id}/members/{user_id}` - Remove member (owner/admin)

#### Projects Integration
- `team_id` column added to `projects` table (nullable)
- Project permissions based on team membership
- Filter projects by personal/team/all
- Team members can view/edit team projects

### Frontend Components

#### Pages
- `/teams` - Teams list with cards
- `/teams/create` - Create new team form
- `/teams/:id` - Team detail with members and projects

#### Features
- Red Team cyberpunk styling with hexagonal accents
- Real-time member management
- Role-based UI controls
- Team selector in project creation form
- Teams link in navigation menu

## 📊 Database Schema

### teams table
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(100) NOT NULL
description     TEXT
created_by      INTEGER REFERENCES users(id)
created_at      TIMESTAMP WITH TIME ZONE
updated_at      TIMESTAMP WITH TIME ZONE
```

### team_members table
```sql
id              SERIAL PRIMARY KEY
team_id         INTEGER REFERENCES teams(id)
user_id         INTEGER REFERENCES users(id)
role            team_role ENUM (owner, admin, member)
joined_at       TIMESTAMP WITH TIME ZONE
UNIQUE(team_id, user_id)
```

### projects table (modified)
```sql
... existing columns ...
team_id         INTEGER REFERENCES teams(id) ON DELETE SET NULL
```

## 🔧 Setup Instructions

### 1. Database Migration

Connect to your PostgreSQL database and run:

```bash
psql -h 72.60.151.201 -U bugbounty_user -d bugbounty_db -f backend/add_teams_functionality.sql
```

Or copy the SQL content and execute in your database client.

### 2. Verify Migration

```sql
-- Check tables were created
SELECT * FROM teams;
SELECT * FROM team_members;

-- Check team_id column on projects
SELECT id, name, owner_id, team_id FROM projects;

-- Verify enum type
SELECT unnest(enum_range(NULL::team_role));
```

### 3. Backend Setup

The backend is already configured. Just restart your FastAPI server:

```bash
cd backend
uvicorn app.main:app --reload
```

### 4. Frontend Setup

No additional setup needed. The frontend is ready to use.

## 🎮 Usage Guide

### Creating a Team

1. Navigate to **My Teams** from the user menu
2. Click **CREATE TEAM**
3. Enter team name and description
4. Click **CREATE TEAM**
5. You'll be redirected to the team detail page

### Adding Members

1. Open team detail page
2. Click **ADD MEMBER** (owner/admin only)
3. Enter member's email address
4. Select role (member/admin)
5. Click **ADD**

### Creating Team Projects

1. Go to **Dashboard**
2. Click **NEW_PROJECT**
3. Fill in project details
4. In the **TEAM** dropdown, select your team
5. Click **CREATE_PROJECT**

All team members will now have access to this project.

### Managing Roles

**Owner Capabilities:**
- Add/remove any member
- Change member roles
- Delete team
- Modify team settings

**Admin Capabilities:**
- Add/remove members (except owner)
- Modify team settings

**Member Capabilities:**
- View team details
- Access team projects
- Leave team

## 🔒 Permission Logic

### Team Access
- Users must be team members to view team details
- Team membership is verified on all team endpoints

### Project Access
- **Personal Projects**: Only owner has access
- **Team Projects**: All team members have access
- **Deletion**: Only project creator can delete (even in teams)

### Role Changes
- Only owner can change roles
- Owner cannot change their own role
- Cannot change another owner's role

### Leaving Team
- Owner cannot leave if other members exist
- Must transfer ownership or delete team first

## 🎨 UI Components

### Teams List
- Grid layout with cyberpunk cards
- Shows team name, description, role badge
- Member count and creation date
- Hexagonal accent decorations

### Team Detail
- Two-column layout
- Left: Members list with management
- Right: Team projects sidebar
- Role-based action buttons

### Create Team Form
- Hexagonal card design
- Character counters (name: 100, description: 500)
- Info box explaining owner privileges
- Scan line animations

## 🧪 Testing

### Backend Testing
```bash
# Test team creation
curl -X POST http://localhost:8000/api/v1/teams \
  -H "Content-Type: application/json" \
  -d '{"name": "Elite Hackers", "description": "Top researchers"}'

# Test adding member
curl -X POST http://localhost:8000/api/v1/teams/1/members \
  -H "Content-Type: application/json" \
  -d '{"email": "member@example.com", "role": "member"}'
```

### Frontend Testing
1. Create a team
2. Add multiple members
3. Create a team project
4. Verify all members can see the project
5. Test role changes
6. Test member removal

## 📈 Future Enhancements

Potential improvements:
- [ ] Team invitations via email with accept/decline
- [ ] Team chat/comments system
- [ ] Activity feed for team actions
- [ ] Team statistics dashboard
- [ ] Export team projects in bulk
- [ ] Team templates for common workflows
- [ ] Integration with team chat platforms (Slack, Discord)
- [ ] Team-specific tags and categories

## 🐛 Troubleshooting

### "Team not found" error
- Verify team exists: `SELECT * FROM teams WHERE id = ?;`
- Check user is a member: `SELECT * FROM team_members WHERE team_id = ? AND user_id = ?;`

### Cannot add member
- Verify email exists in users table
- Check user isn't already a member
- Confirm you have admin/owner role

### Team projects not visible
- Verify project.team_id is set correctly
- Check user is a team member
- Ensure backend team membership checks are working

## 📝 Notes

- All existing projects are **personal** by default (team_id = NULL)
- Team deletion cascades to team_members but sets project.team_id to NULL
- Owners can have multiple teams
- Users can be members of unlimited teams
- Team names are case-sensitive and not unique across the system

## 🔗 Related Files

**Backend:**
- `backend/app/models/team.py`
- `backend/app/schemas/team.py`
- `backend/app/api/routers/teams.py`
- `backend/app/models/project.py` (modified)
- `backend/app/api/routers/projects.py` (modified)
- `backend/add_teams_functionality.sql`

**Frontend:**
- `frontend/src/pages/Teams.jsx`
- `frontend/src/pages/CreateTeam.jsx`
- `frontend/src/pages/TeamDetail.jsx`
- `frontend/src/pages/Dashboard.jsx` (modified)
- `frontend/src/services/api.js` (modified)
- `frontend/src/App.jsx` (modified)
- `frontend/src/components/Navbar.jsx` (modified)
