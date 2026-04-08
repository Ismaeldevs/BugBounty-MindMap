# Import all schemas for easy access
from app.schemas.user import (
    User,
    UserCreate,
    UserUpdate,
    UserLogin,
    UserInDB,
    Token,
    TokenPayload
)
from app.schemas.project import (
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectInDB,
    ProjectWithNodes,
    ProjectExport,
    ProjectImport
)
from app.schemas.mindmap_node import (
    MindMapNode,
    MindMapNodeCreate,
    MindMapNodeUpdate,
    MindMapNodeInDB,
    NodeType,
    NodeStatus,
    BulkNodeCreate,
    BulkNodeUpdate
)

__all__ = [
    # User schemas
    "User",
    "UserCreate",
    "UserUpdate",
    "UserLogin",
    "UserInDB",
    "Token",
    "TokenPayload",
    # Project schemas
    "Project",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectInDB",
    "ProjectWithNodes",
    "ProjectExport",
    "ProjectImport",
    # MindMap Node schemas
    "MindMapNode",
    "MindMapNodeCreate",
    "MindMapNodeUpdate",
    "MindMapNodeInDB",
    "NodeType",
    "NodeStatus",
    "BulkNodeCreate",
    "BulkNodeUpdate"
]
