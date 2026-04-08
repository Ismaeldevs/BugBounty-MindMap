from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base


class NodeType(str, enum.Enum):
    """Enum for different types of nodes in the mindmap."""
    ROOT = "root"  # Main domain/target
    SUBDOMAIN = "subdomain"
    ENDPOINT = "endpoint"
    TECHNOLOGY = "technology"
    VULNERABILITY = "vulnerability"
    NOTE = "note"
    IP_ADDRESS = "ip_address"


class NodeStatus(str, enum.Enum):
    """Enum for node status/state."""
    IN_SCOPE = "in_scope"
    OUT_OF_SCOPE = "out_of_scope"
    RECONNAISSANCE = "reconnaissance"
    TESTING = "testing"
    VULNERABLE = "vulnerable"
    PATCHED = "patched"
    REPORTED = "reported"


class MindMapNode(Base):
    """
    MindMapNode represents a single node in the mindmap visualization.
    Can represent domains, subdomains, IPs, technologies, vulnerabilities, etc.
    Stores position, metadata, and connections to other nodes.
    """
    __tablename__ = "mindmap_nodes"

    id = Column(Integer, primary_key=True, index=True)
    
    # Node identification
    node_id = Column(String, unique=True, index=True, nullable=False)  # UUID for ReactFlow
    label = Column(String, nullable=False)  # Display name
    node_type = Column(SQLEnum(NodeType), default=NodeType.SUBDOMAIN)
    status = Column(SQLEnum(NodeStatus), default=NodeStatus.RECONNAISSANCE)
    
    # Position in canvas (for ReactFlow)
    position_x = Column(Float, default=0.0)
    position_y = Column(Float, default=0.0)
    
    # Rich metadata for Bug Bounty reconnaissance
    data = Column(JSON, default=dict)  # Flexible JSON for additional data
    # Example data structure:
    # {
    #     "ip_address": "192.168.1.1",
    #     "ports": [80, 443, 8080],
    #     "technologies": ["nginx", "php", "mysql"],
    #     "waf": "cloudflare",
    #     "cdn": "cloudflare",
    #     "status_code": 200,
    #     "response_size": 1234,
    #     "headers": {...},
    #     "cms": "wordpress",
    #     "version": "5.8",
    #     "cves": ["CVE-2021-1234"]
    # }
    
    # Notes and documentation
    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=list)  # ["critical", "web", "api"]
    
    # Visual properties
    color = Column(String, default="#64748b")  # Hex color for node
    
    # Relationships and connections
    connections = Column(JSON, default=list)  # List of connected node_ids
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="nodes")

    def __repr__(self):
        return f"<MindMapNode(id={self.id}, label='{self.label}', type={self.node_type})>"
