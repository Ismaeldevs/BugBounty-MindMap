from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


# ==================== USER SCHEMAS ====================

class UserBase(BaseModel):
    """Base user schema with common attributes."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100)
    turnstile_token: Optional[str] = None  # Cloudflare Turnstile token
    
    @validator("password")
    def validate_password(cls, v):
        """Ensure password meets security requirements."""
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter")
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    current_password: Optional[str] = None  # Required when changing password
    
    @validator("password")
    def validate_password(cls, v):
        """Ensure password meets security requirements."""
        if v is not None:
            if not any(char.isdigit() for char in v):
                raise ValueError("Password must contain at least one digit")
            if not any(char.isupper() for char in v):
                raise ValueError("Password must contain at least one uppercase letter")
            if not any(char.islower() for char in v):
                raise ValueError("Password must contain at least one lowercase letter")
        return v


class UserInDB(UserBase):
    """Schema for user as stored in database."""
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class User(UserInDB):
    """Public user schema (excludes sensitive data)."""
    pass


# ==================== TOKEN SCHEMAS ====================

class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: Optional[int] = None


# ==================== VERIFICATION SCHEMAS ====================

class VerifyEmail(BaseModel):
    """Schema for email verification."""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)


class ResendCode(BaseModel):
    """Schema for resending verification code."""
    email: EmailStr
    exp: Optional[int] = None
