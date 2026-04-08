from __future__ import annotations

from pydantic import BaseModel, Field, validator
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.schemas.mindmap_node import MindMapNodeInDB, MindMapNodeCreate


# ==================== PROJECT SCHEMAS ====================

class ProjectBase(BaseModel):
    """Base project schema with common attributes."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scope: Optional[str] = None
    program_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    status: str = Field(default="active")
    
    @validator("status")
    def validate_status(cls, v):
        """Validate project status."""
        allowed_statuses = ["active", "archived", "completed"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    team_id: Optional[int] = None


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    scope: Optional[str] = None
    program_url: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    
    @validator("status")
    def validate_status(cls, v):
        """Validate project status."""
        if v is not None:
            allowed_statuses = ["active", "archived", "completed"]
            if v not in allowed_statuses:
                raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class ProjectInDB(ProjectBase):
    """Schema for project as stored in database."""
    id: int
    owner_id: int
    team_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class Project(ProjectInDB):
    """Public project schema."""
    pass


class ProjectWithNodes(Project):
    """Project schema including mindmap nodes."""
    nodes: List["MindMapNodeInDB"] = []
    
    class Config:
        from_attributes = True


# ==================== PROJECT EXPORT/IMPORT SCHEMAS ====================

class ProjectExport(BaseModel):
    """Schema for exporting a project with all its data."""
    project: Project
    nodes: List["MindMapNodeInDB"]
    export_date: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0"


class ProjectImport(BaseModel):
    """Schema for importing a project."""
    project: ProjectCreate
    nodes: List["MindMapNodeCreate"]
