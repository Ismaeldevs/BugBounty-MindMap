from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.team import Team, TeamMember, TeamRole
from app.models.project import Project
from app.schemas.team import (
    TeamCreate, 
    TeamUpdate, 
    TeamInDB, 
    TeamWithMembers,
    TeamListResponse,
    TeamDetailResponse,
    TeamMemberCreate,
    TeamMemberUpdate,
    TeamMemberWithUser
)
from app.api.dependencies import get_current_active_user

router = APIRouter()


# Helper functions for permissions
def get_team_or_404(db: Session, team_id: int) -> Team:
    """Get team by ID or raise 404"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    return team


def check_team_membership(db: Session, team_id: int, user_id: int) -> TeamMember:
    """Check if user is a member of the team"""
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team"
        )
    return membership


def check_team_owner(db: Session, team_id: int, user_id: int) -> TeamMember:
    """Check if user is the owner of the team"""
    membership = check_team_membership(db, team_id, user_id)
    
    if membership.role != TeamRole.owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can perform this action"
        )
    return membership


def check_team_admin(db: Session, team_id: int, user_id: int) -> TeamMember:
    """Check if user is owner or admin of the team"""
    membership = check_team_membership(db, team_id, user_id)
    
    if membership.role not in [TeamRole.owner, TeamRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners and admins can perform this action"
        )
    return membership


# Team CRUD endpoints
@router.post("/teams", response_model=TeamInDB, status_code=status.HTTP_201_CREATED)
async def create_team(
    team: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new team"""
    # Create team
    db_team = Team(
        name=team.name,
        description=team.description,
        created_by=current_user.id
    )
    db.add(db_team)
    db.flush()
    
    # Add creator as owner
    team_member = TeamMember(
        team_id=db_team.id,
        user_id=current_user.id,
        role=TeamRole.owner
    )
    db.add(team_member)
    db.commit()
    db.refresh(db_team)
    
    return db_team


@router.get("/teams", response_model=TeamListResponse)
async def list_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all teams the current user is a member of"""
    # Get teams where user is a member
    teams_query = db.query(
        Team,
        func.count(TeamMember.id).label('members_count'),
        TeamMember.role.label('user_role')
    ).join(
        TeamMember, Team.id == TeamMember.team_id
    ).filter(
        TeamMember.user_id == current_user.id
    ).group_by(
        Team.id, TeamMember.role
    ).all()
    
    teams = []
    for team, members_count, user_role in teams_query:
        team_dict = TeamInDB.model_validate(team).model_dump()
        team_dict['members_count'] = members_count
        team_dict['user_role'] = user_role
        teams.append(TeamWithMembers(**team_dict))
    
    return TeamListResponse(teams=teams, total=len(teams))


@router.get("/teams/{team_id}", response_model=TeamDetailResponse)
async def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get team details with members"""
    team = get_team_or_404(db, team_id)
    check_team_membership(db, team_id, current_user.id)
    
    # Get members with user info
    members = db.query(
        TeamMember,
        User.username,
        User.email
    ).join(
        User, TeamMember.user_id == User.id
    ).filter(
        TeamMember.team_id == team_id
    ).all()
    
    members_list = []
    for member, username, email in members:
        member_dict = {
            'id': member.id,
            'team_id': member.team_id,
            'user_id': member.user_id,
            'role': member.role,
            'joined_at': member.joined_at,
            'username': username,
            'email': email
        }
        members_list.append(TeamMemberWithUser(**member_dict))
    
    # Count projects
    projects_count = db.query(func.count(Project.id)).filter(
        Project.team_id == team_id
    ).scalar()
    
    team_dict = TeamInDB.model_validate(team).model_dump()
    team_dict['members'] = members_list
    team_dict['projects_count'] = projects_count
    
    return TeamDetailResponse(**team_dict)


@router.put("/teams/{team_id}", response_model=TeamInDB)
async def update_team(
    team_id: int,
    team_update: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update team information (owner/admin only)"""
    team = get_team_or_404(db, team_id)
    check_team_admin(db, team_id, current_user.id)
    
    # Update fields
    if team_update.name is not None:
        team.name = team_update.name
    if team_update.description is not None:
        team.description = team_update.description
    
    db.commit()
    db.refresh(team)
    
    return team


@router.delete("/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a team (owner only). Also deletes all team projects."""
    team = get_team_or_404(db, team_id)
    check_team_owner(db, team_id, current_user.id)
    
    # Delete all projects associated with this team
    db.query(Project).filter(Project.team_id == team_id).delete()
    
    # Delete the team (members will be deleted by CASCADE)
    db.delete(team)
    db.commit()
    
    return None


# Team Members endpoints
@router.post("/teams/{team_id}/members", response_model=TeamMemberWithUser, status_code=status.HTTP_201_CREATED)
async def add_team_member(
    team_id: int,
    member: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a member to the team (owner/admin only)"""
    team = get_team_or_404(db, team_id)
    check_team_admin(db, team_id, current_user.id)
    
    # Find user by email
    user = db.query(User).filter(User.email == member.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {member.email} not found"
        )
    
    # Check if already a member
    existing = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this team"
        )
    
    # Add member
    team_member = TeamMember(
        team_id=team_id,
        user_id=user.id,
        role=member.role
    )
    db.add(team_member)
    db.commit()
    db.refresh(team_member)
    
    # Return with user info
    return TeamMemberWithUser(
        id=team_member.id,
        team_id=team_member.team_id,
        user_id=team_member.user_id,
        role=team_member.role,
        joined_at=team_member.joined_at,
        username=user.username,
        email=user.email
    )


@router.get("/teams/{team_id}/members", response_model=List[TeamMemberWithUser])
async def list_team_members(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all members of a team"""
    team = get_team_or_404(db, team_id)
    check_team_membership(db, team_id, current_user.id)
    
    members = db.query(
        TeamMember,
        User.username,
        User.email
    ).join(
        User, TeamMember.user_id == User.id
    ).filter(
        TeamMember.team_id == team_id
    ).all()
    
    members_list = []
    for member, username, email in members:
        members_list.append(TeamMemberWithUser(
            id=member.id,
            team_id=member.team_id,
            user_id=member.user_id,
            role=member.role,
            joined_at=member.joined_at,
            username=username,
            email=email
        ))
    
    return members_list


@router.put("/teams/{team_id}/members/{user_id}", response_model=TeamMemberWithUser)
async def update_member_role(
    team_id: int,
    user_id: int,
    role_update: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a team member's role (owner only)"""
    team = get_team_or_404(db, team_id)
    check_team_owner(db, team_id, current_user.id)
    
    # Can't change your own role
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role"
        )
    
    # Get member
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    # Can't change another owner's role
    if member.role == TeamRole.owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change another owner's role"
        )
    
    # Update role
    member.role = role_update.role
    db.commit()
    db.refresh(member)
    
    # Get user info
    user = db.query(User).filter(User.id == user_id).first()
    
    return TeamMemberWithUser(
        id=member.id,
        team_id=member.team_id,
        user_id=member.user_id,
        role=member.role,
        joined_at=member.joined_at,
        username=user.username,
        email=user.email
    )


@router.delete("/teams/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a member from the team (owner/admin only, or self)"""
    team = get_team_or_404(db, team_id)
    
    # Check if removing self or if admin/owner
    if user_id != current_user.id:
        check_team_admin(db, team_id, current_user.id)
    
    # Get member
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    # Can't remove the owner
    if member.role == TeamRole.owner and user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove team owner"
        )
    
    # If owner is leaving, check if there are other members
    if member.role == TeamRole.owner and user_id == current_user.id:
        other_members = db.query(func.count(TeamMember.id)).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id != current_user.id
        ).scalar()
        
        if other_members > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transfer ownership before leaving the team or delete the team"
            )
    
    db.delete(member)
    db.commit()
    
    return None
