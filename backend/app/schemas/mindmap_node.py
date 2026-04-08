from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class NodeType(str, Enum):
    """Node types for mindmap."""
    ROOT = "root"
    SUBDOMAIN = "subdomain"
    ENDPOINT = "endpoint"
    TECHNOLOGY = "technology"
    VULNERABILITY = "vulnerability"
    NOTE = "note"
    IP_ADDRESS = "ip_address"


class NodeStatus(str, Enum):
    """Node status/state."""
    IN_SCOPE = "in_scope"
    OUT_OF_SCOPE = "out_of_scope"
    RECONNAISSANCE = "reconnaissance"
    TESTING = "testing"
    VULNERABLE = "vulnerable"
    PATCHED = "patched"
    REPORTED = "reported"


# ==================== MINDMAP NODE SCHEMAS ====================

class MindMapNodeBase(BaseModel):
    """Base mindmap node schema with common attributes."""
    node_id: str = Field(..., min_length=1)
    label: str = Field(..., min_length=1, max_length=500)
    node_type: NodeType = NodeType.SUBDOMAIN
    status: NodeStatus = NodeStatus.RECONNAISSANCE
    position_x: float = 0.0
    position_y: float = 0.0
    data: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    color: str = Field(default="#64748b")
    connections: List[str] = Field(default_factory=list)
    
    @validator("color")
    def validate_color(cls, v):
        """Validate hex color format."""
        if not v.startswith("#") or len(v) not in [4, 7]:
            raise ValueError("Color must be a valid hex color (e.g., #FFF or #FFFFFF)")
        return v


class MindMapNodeCreate(MindMapNodeBase):
    """Schema for creating a new mindmap node."""
    pass


class MindMapNodeUpdate(BaseModel):
    """Schema for updating a mindmap node."""
    label: Optional[str] = Field(None, min_length=1, max_length=500)
    node_type: Optional[NodeType] = None
    status: Optional[NodeStatus] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    color: Optional[str] = None
    connections: Optional[List[str]] = None
    
    @validator("color")
    def validate_color(cls, v):
        """Validate hex color format."""
        if v is not None:
            if not v.startswith("#") or len(v) not in [4, 7]:
                raise ValueError("Color must be a valid hex color (e.g., #FFF or #FFFFFF)")
        return v


class MindMapNodeInDB(MindMapNodeBase):
    """Schema for mindmap node as stored in database."""
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class MindMapNode(MindMapNodeInDB):
    """Public mindmap node schema."""
    pass


# ==================== BULK OPERATIONS ====================

class BulkNodeUpdate(BaseModel):
    """Schema for bulk updating multiple nodes."""
    nodes: List[MindMapNodeUpdate]


class BulkNodeCreate(BaseModel):
    """Schema for bulk creating multiple nodes."""
    nodes: List[MindMapNodeCreate]
