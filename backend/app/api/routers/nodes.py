from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.mindmap_node import MindMapNode
from app.models.team import TeamMember
from app.schemas.mindmap_node import (
    MindMapNode as MindMapNodeSchema,
    MindMapNodeCreate,
    MindMapNodeUpdate,
    BulkNodeCreate
)
from app.api.dependencies import get_current_active_user

router = APIRouter()


def verify_project_access(project_id: int, user_id: int, db: Session) -> Project:
    """Helper function to verify project access (owner or team member)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user is the owner
    if project.owner_id == user_id:
        return project
    
    # Check if project belongs to a team and user is a member
    if project.team_id:
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == project.team_id,
            TeamMember.user_id == user_id
        ).first()
        
        if team_member:
            return project
    
    # No access
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Project not found or access denied"
    )
    return project


@router.post("/{project_id}/nodes", response_model=MindMapNodeSchema, status_code=status.HTTP_201_CREATED)
def create_node(
    project_id: int,
    node_in: MindMapNodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new mindmap node in a project.
    
    - **node_id**: Unique identifier for ReactFlow (UUID recommended)
    - **label**: Display name for the node
    - **node_type**: Type of node (root, subdomain, endpoint, etc.)
    - **status**: Current status (in_scope, reconnaissance, testing, etc.)
    - **position_x/position_y**: Canvas position
    - **data**: Rich metadata (IPs, ports, technologies, vulnerabilities)
    - **notes**: Custom notes
    - **tags**: Categorization tags
    - **color**: Hex color for visual distinction
    - **connections**: List of connected node IDs
    """
    # Verify project ownership
    verify_project_access(project_id, current_user.id, db)
    
    # Check if node_id already exists in this project
    existing = db.query(MindMapNode)\
        .filter(MindMapNode.project_id == project_id, MindMapNode.node_id == node_in.node_id)\
        .first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Node with this node_id already exists in project"
        )
    
    # Create node
    db_node = MindMapNode(
        **node_in.model_dump(),
        project_id=project_id
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node


@router.post("/{project_id}/nodes/bulk", response_model=List[MindMapNodeSchema], status_code=status.HTTP_201_CREATED)
def create_nodes_bulk(
    project_id: int,
    nodes_in: BulkNodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create multiple mindmap nodes at once.
    Useful for importing reconnaissance data from tools.
    """
    # Verify project ownership
    verify_project_access(project_id, current_user.id, db)
    
    created_nodes = []
    for node_in in nodes_in.nodes:
        # Check for duplicates
        existing = db.query(MindMapNode)\
            .filter(MindMapNode.project_id == project_id, MindMapNode.node_id == node_in.node_id)\
            .first()
        
        if not existing:
            db_node = MindMapNode(
                **node_in.model_dump(),
                project_id=project_id
            )
            db.add(db_node)
            created_nodes.append(db_node)
    
    db.commit()
    for node in created_nodes:
        db.refresh(node)
    
    return created_nodes


@router.get("/{project_id}/nodes", response_model=List[MindMapNodeSchema])
def list_nodes(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all mindmap nodes for a project.
    """
    # Verify project ownership
    verify_project_access(project_id, current_user.id, db)
    
    nodes = db.query(MindMapNode)\
        .filter(MindMapNode.project_id == project_id)\
        .all()
    
    return nodes


@router.get("/{project_id}/nodes/{node_id}", response_model=MindMapNodeSchema)
def get_node(
    project_id: int,
    node_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific mindmap node by its node_id.
    """
    # Verify project ownership
    verify_project_access(project_id, current_user.id, db)
    
    node = db.query(MindMapNode)\
        .filter(MindMapNode.project_id == project_id, MindMapNode.node_id == node_id)\
        .first()
    
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    return node


@router.put("/{project_id}/nodes/{node_id}", response_model=MindMapNodeSchema)
def update_node(
    project_id: int,
    node_id: str,
    node_in: MindMapNodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a mindmap node.
    Used for updating position (drag & drop), data, notes, status, etc.
    """
    # Verify project ownership
    verify_project_access(project_id, current_user.id, db)
    
    node = db.query(MindMapNode)\
        .filter(MindMapNode.project_id == project_id, MindMapNode.node_id == node_id)\
        .first()
    
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    # Update only provided fields
    update_data = node_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(node, field, value)
    
    db.commit()
    db.refresh(node)
    return node


@router.delete("/{project_id}/nodes/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(
    project_id: int,
    node_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a mindmap node.
    """
    # Verify project ownership
    verify_project_access(project_id, current_user.id, db)
    
    node = db.query(MindMapNode)\
        .filter(MindMapNode.project_id == project_id, MindMapNode.node_id == node_id)\
        .first()
    
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    db.delete(node)
    db.commit()
    return None
