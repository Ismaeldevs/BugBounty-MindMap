from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TeamRole(str, Enum):
    owner = "owner"
    admin = "admin"
    member = "member"


# Team Schemas
class TeamBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class TeamInDB(TeamBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TeamWithMembers(TeamInDB):
    members_count: int = 0
    user_role: Optional[TeamRole] = None


# TeamMember Schemas
class TeamMemberBase(BaseModel):
    user_id: int
    role: TeamRole = TeamRole.member


class TeamMemberCreate(BaseModel):
    email: str = Field(..., description="Email del usuario a añadir")
    role: TeamRole = TeamRole.member


class TeamMemberUpdate(BaseModel):
    role: TeamRole


class TeamMemberInDB(TeamMemberBase):
    id: int
    team_id: int
    joined_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TeamMemberWithUser(BaseModel):
    id: int
    team_id: int
    user_id: int
    role: TeamRole
    joined_at: datetime
    username: str
    email: str
    
    model_config = ConfigDict(from_attributes=True)


# Response Schemas
class TeamListResponse(BaseModel):
    teams: List[TeamWithMembers]
    total: int


class TeamDetailResponse(TeamInDB):
    members: List[TeamMemberWithUser]
    projects_count: int = 0
