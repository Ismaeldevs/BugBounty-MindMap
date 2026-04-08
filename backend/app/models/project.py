from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class Project(Base):
    """
    Project model representing a Bug Bounty program or pentest engagement.
    Contains program information and metadata.
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    scope = Column(Text, nullable=True)  # Target domains/IPs
    program_url = Column(String, nullable=True)  # HackerOne, Bugcrowd, etc.
    
    # Metadata
    tags = Column(JSON, default=list)  # ["web", "mobile", "api"]
    status = Column(String, default="active")  # active, archived, completed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    team = relationship("Team", back_populates="projects")
    nodes = relationship("MindMapNode", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"
