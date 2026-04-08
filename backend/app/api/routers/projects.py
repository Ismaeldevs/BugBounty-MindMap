from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.mindmap_node import MindMapNode
from app.models.team import Team, TeamMember
from app.schemas.project import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate
)
from app.api.dependencies import get_current_active_user
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new Bug Bounty project.
    
    - **name**: Project name (required)
    - **description**: Optional project description
    - **scope**: Target domains/IPs in scope
    - **program_url**: URL to Bug Bounty program (HackerOne, Bugcrowd, etc.)
    - **tags**: List of tags for categorization
    - **status**: Project status (active, archived, completed)
    - **team_id**: Optional team ID (user must be member)
    """
    # If team_id provided, verify user is a member
    if project_in.team_id:
        membership = db.query(TeamMember).filter(
            TeamMember.team_id == project_in.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this team"
            )
    
    db_project = Project(
        **project_in.model_dump(),
        owner_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/", response_model=List[ProjectSchema])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    filter_type: Optional[str] = Query(None, description="Filter: 'personal', 'team', or None for all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all projects accessible by the current user.
    Includes personal projects and team projects.
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **filter_type**: Filter by 'personal' or 'team' projects
    """
    # Get user's team IDs
    user_team_ids = db.query(TeamMember.team_id).filter(
        TeamMember.user_id == current_user.id
    ).all()
    team_ids = [t[0] for t in user_team_ids]
    
    query = db.query(Project)
    
    if filter_type == "personal":
        # Only personal projects
        query = query.filter(
            Project.owner_id == current_user.id,
            Project.team_id.is_(None)
        )
    elif filter_type == "team":
        # Only team projects
        query = query.filter(
            Project.team_id.in_(team_ids) if team_ids else False
        )
    else:
        # All accessible projects (personal + team)
        query = query.filter(
            or_(
                Project.owner_id == current_user.id,
                Project.team_id.in_(team_ids) if team_ids else False
            )
        )
    
    projects = query.offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific project by ID.
    User must be owner or team member.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check access: owner or team member
    has_access = project.owner_id == current_user.id
    
    if not has_access and project.team_id:
        membership = db.query(TeamMember).filter(
            TeamMember.team_id == project.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        has_access = membership is not None
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project"
        )
    
    return project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a project's information.
    Owner can update anything. Team members can update if they have permission.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check access: owner or team member
    is_owner = project.owner_id == current_user.id
    has_access = is_owner
    
    if not has_access and project.team_id:
        membership = db.query(TeamMember).filter(
            TeamMember.team_id == project.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        has_access = membership is not None
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project"
        )
    
    # Update only provided fields
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a project and all its associated mindmap nodes.
    Only the project owner can delete (even in team projects).
    """
    project = db.query(Project)\
        .filter(Project.id == project_id, Project.owner_id == current_user.id)\
        .first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission to delete it"
        )
    
    db.delete(project)
    db.commit()
    return None


@router.get("/{project_id}/export")
def export_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Export a project with all its nodes as JSON.
    Useful for backup or sharing reconnaissance data.
    User must be owner or team member.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check access: owner or team member
    has_access = project.owner_id == current_user.id
    
    if not has_access and project.team_id:
        membership = db.query(TeamMember).filter(
            TeamMember.team_id == project.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        has_access = membership is not None
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project"
        )
    
    # Get all nodes for this project
    nodes = db.query(MindMapNode)\
        .filter(MindMapNode.project_id == project_id)\
        .all()
    
    # Convert to dict manually
    from datetime import datetime
    return {
        "project": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "scope": project.scope,
            "program_url": project.program_url,
            "tags": project.tags,
            "status": project.status,
            "created_at": project.created_at.isoformat() if project.created_at else None,
            "updated_at": project.updated_at.isoformat() if project.updated_at else None
        },
        "nodes": [{
            "node_id": node.node_id,
            "label": node.label,
            "node_type": node.node_type,
            "status": node.status,
            "position_x": node.position_x,
            "position_y": node.position_y,
            "data": node.data,
            "notes": node.notes,
            "tags": node.tags,
            "color": node.color,
            "connections": node.connections
        } for node in nodes],
        "export_date": datetime.utcnow().isoformat(),
        "version": "1.0"
    }
