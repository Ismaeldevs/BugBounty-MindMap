from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserCreate, User as UserSchema, Token, UserLogin, UserUpdate,
    VerifyEmail, ResendCode
)
from app.api.dependencies import get_current_active_user
from app.services.email_service import (
    generate_verification_code, get_code_expiry_time, send_verification_email
)
from app.services.turnstile_service import verify_turnstile_token, get_client_ip

router = APIRouter()


@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register_user(
    request: Request,
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user with Turnstile protection and email verification.
    
    - **email**: Valid email address (must be unique)
    - **username**: Username (must be unique, 3-50 characters)
    - **password**: Strong password (min 8 chars, must contain uppercase, lowercase, and digit)
    - **turnstile_token**: Cloudflare Turnstile token (if enabled)
    
    Sends verification code to email. User must verify before accessing protected routes.
    """
    # Verify Turnstile token if enabled
    if settings.TURNSTILE_ENABLED:
        if not user_in.turnstile_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Turnstile verification required"
            )
        
        client_ip = get_client_ip(request)
        is_valid = await verify_turnstile_token(user_in.turnstile_token, client_ip)
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Turnstile verification failed. Please try again."
            )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        # If user exists but is not verified, resend verification code
        if not existing_user.is_verified:
            # Generate new verification code
            verification_code = generate_verification_code()
            code_expires_at = get_code_expiry_time()
            
            existing_user.verification_code = verification_code
            existing_user.code_expires_at = code_expires_at
            existing_user.verification_attempts = 0
            db.commit()
            
            # Send verification email
            await send_verification_email(
                email=existing_user.email,
                username=existing_user.username,
                code=verification_code
            )
            
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered but not verified. New verification code sent."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if username already exists
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Generate verification code
    verification_code = generate_verification_code()
    code_expires_at = get_code_expiry_time()
    
    # Create new user (unverified)
    db_user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        is_verified=False,
        verification_code=verification_code,
        code_expires_at=code_expires_at,
        verification_attempts=0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send verification email
    email_sent = await send_verification_email(
        email=db_user.email,
        username=db_user.username,
        code=verification_code
    )
    
    if not email_sent:
        # Log error but don't fail registration
        # User can request resend
        pass
    
    return db_user


@router.post("/login", response_model=Token)
def login(
    response: Response,
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login with email and password. Sets JWT token in HttpOnly cookie.
    
    - **email**: User's email
    - **password**: User's password
    
    Returns token info and sets secure HttpOnly cookie.
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Check if user is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email to login."
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )
    
    # Set token in HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Only send over HTTPS in production
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/form", response_model=Token)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login (for Swagger UI).
    Uses username field for email.
    """
    # Find user by email (using username field from form)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSchema)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user information.
    Requires valid JWT token in cookie or Authorization header.
    """
    return current_user


@router.post("/logout")
def logout(response: Response):
    """
    Logout user by clearing the authentication cookie.
    """
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}


@router.put("/profile", response_model=UserSchema)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    
    - **email**: New email (optional, must be unique)
    - **username**: New username (optional, must be unique)
    - **password**: New password (optional)
    - **current_password**: Current password (required when changing password)
    
    Requires valid JWT token.
    """
    # Check if email is being updated and is not already taken
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    # Check if username is being updated and is not already taken
    if user_update.username and user_update.username != current_user.username:
        existing_user = db.query(User).filter(User.username == user_update.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_update.username
    
    # Handle password update
    if user_update.password:
        # Verify current password
        if not user_update.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password"
            )
        
        if not verify_password(user_update.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        
        # Update password
        current_user.hashed_password = get_password_hash(user_update.password)
    
    # Commit changes
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.post("/verify-email", response_model=UserSchema)
def verify_email(
    verify_data: VerifyEmail,
    db: Session = Depends(get_db)
):
    """
    Verify user email with 6-digit code.
    
    - **email**: User's email address
    - **code**: 6-digit verification code from email
    
    Marks user as verified on success. Max 5 attempts per code.
    """
    # Find user by email
    user = db.query(User).filter(User.email == verify_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already verified
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Check if code exists
    if not user.verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification code found. Please request a new one."
        )
    
    # Check if code expired
    if user.code_expires_at and user.code_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code expired. Please request a new one."
        )
    
    # Check attempts limit
    if user.verification_attempts >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please request a new code."
        )
    
    # Verify code
    if user.verification_code != verify_data.code:
        user.verification_attempts += 1
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {5 - user.verification_attempts} attempts remaining."
        )
    
    # Success - mark as verified and clear verification data
    user.is_verified = True
    user.verification_code = None
    user.code_expires_at = None
    user.verification_attempts = 0
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/resend-code")
async def resend_verification_code(
    resend_data: ResendCode,
    db: Session = Depends(get_db)
):
    """
    Resend verification code to user's email.
    
    - **email**: User's email address
    
    Generates new 6-digit code and extends expiration time.
    """
    # Find user by email
    user = db.query(User).filter(User.email == resend_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already verified
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new verification code
    verification_code = generate_verification_code()
    code_expires_at = get_code_expiry_time()
    
    # Update user with new code
    user.verification_code = verification_code
    user.code_expires_at = code_expires_at
    user.verification_attempts = 0  # Reset attempts
    db.commit()
    
    # Send verification email
    email_sent = await send_verification_email(
        email=user.email,
        username=user.username,
        code=verification_code
    )
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again later."
        )
    
    return {"message": "Verification code sent successfully"}
