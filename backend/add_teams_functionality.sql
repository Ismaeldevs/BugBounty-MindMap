-- ============================================================
-- MIGRATION: Add Teams Functionality
-- Description: Create tables for teams and team members
--              Add team_id column to projects table
-- ============================================================

-- Create custom type for team roles
DO $$ BEGIN
    CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for teams table
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role team_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Create indexes for team_members table
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);

-- Add team_id column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL;

-- Create index for team_id on projects
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);

-- Add comment explaining team_id
COMMENT ON COLUMN projects.team_id IS 'Optional team ID. NULL means personal project, otherwise project is shared with team.';

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these queries to verify the migration was successful:
--
-- 1. Check teams table:
--    SELECT * FROM teams;
--
-- 2. Check team_members table:
--    SELECT * FROM team_members;
--
-- 3. Check projects.team_id column:
--    SELECT id, name, owner_id, team_id FROM projects;
--
-- 4. Verify enum type:
--    SELECT unnest(enum_range(NULL::team_role));
--
-- ============================================================
-- EXAMPLE USAGE
-- ============================================================
-- Create a test team:
--   INSERT INTO teams (name, description, created_by) 
--   VALUES ('Elite Hackers', 'Top security researchers', 1);
--
-- Add a member:
--   INSERT INTO team_members (team_id, user_id, role) 
--   VALUES (1, 1, 'owner');
--
-- Create a team project:
--   INSERT INTO projects (name, description, owner_id, team_id) 
--   VALUES ('Team Project', 'Shared project', 1, 1);
-- ============================================================

-- Migration completed successfully
SELECT 'Teams migration completed successfully!' AS status;
