from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash


def init_db(db: Session) -> None:
    """
    Initialize database with default data if needed.
    Create a default admin user for development.
    """
    # Check if there are any users
    user = db.query(User).first()
    if not user:
        # Create a default user for development
        default_user = User(
            email="admin@bugbounty.local",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
        print("Default admin user created: admin@bugbounty.local / admin123")
