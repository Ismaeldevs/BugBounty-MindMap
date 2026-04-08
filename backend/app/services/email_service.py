"""
Email service for sending verification codes and notifications.
Supports both production (SendGrid) and development (console logging) modes.
"""
import random
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from app.core.config import settings

logger = logging.getLogger(__name__)


def generate_verification_code() -> str:
    """Generate a 6-digit verification code."""
    return str(random.randint(100000, 999999))


def get_code_expiry_time() -> datetime:
    """Get expiration time for verification code (10 minutes from now)."""
    return datetime.now(timezone.utc) + timedelta(minutes=10)


async def send_verification_email(email: str, username: str, code: str) -> bool:
    """
    Send verification code via email.
    
    Args:
        email: Recipient email address
        username: Username for personalization
        code: 6-digit verification code
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        if not settings.EMAIL_ENABLED:
            # Development mode: Log to console
            logger.info("=" * 60)
            logger.info("📧 EMAIL VERIFICATION CODE (Development Mode)")
            logger.info("=" * 60)
            logger.info(f"To: {email}")
            logger.info(f"Username: {username}")
            logger.info(f"Verification Code: {code}")
            logger.info(f"Expires in: 10 minutes")
            logger.info("=" * 60)
            print(f"\n🔐 VERIFICATION CODE for {username} ({email}): {code}\n")
            return True
        
        # Production mode: Send via SendGrid
        message = Mail(
            from_email=Email(settings.FROM_EMAIL, settings.FROM_NAME),
            to_emails=To(email),
            subject=f"Verify your {settings.FROM_NAME} account",
            html_content=get_verification_email_html(username, code)
        )
        
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        if response.status_code in [200, 201, 202]:
            logger.info(f"Verification email sent to {email}")
            return True
        else:
            logger.error(f"Failed to send email. Status: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending verification email: {str(e)}")
        return False


def get_verification_email_html(username: str, code: str) -> str:
    """
    Generate HTML content for verification email.
    
    Args:
        username: Username for personalization
        code: 6-digit verification code
    
    Returns:
        str: HTML email content
    """
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: 'Courier New', monospace;
            background-color: #0d0d0d;
            color: #ffffff;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(135deg, #1a0f0f 0%, #2d2d2d 100%);
            border: 2px solid #cc0000;
            padding: 40px;
            box-shadow: 0 0 30px rgba(204, 0, 0, 0.3);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        h1 {{
            color: #cc0000;
            font-size: 28px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }}
        .content {{
            line-height: 1.8;
            font-size: 14px;
        }}
        .code-box {{
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid #00ff41;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
        }}
        .code {{
            font-size: 36px;
            font-weight: bold;
            color: #00ff41;
            letter-spacing: 10px;
            font-family: 'Courier New', monospace;
        }}
        .warning {{
            color: #ff4444;
            font-size: 12px;
            margin-top: 20px;
            text-align: center;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #4a0e4e;
            text-align: center;
            font-size: 12px;
            color: #888;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Email Verification</h1>
        </div>
        <div class="content">
            <p>Hello <strong style="color: #00ff41;">{username}</strong>,</p>
            <p>Welcome to the Bug Bounty Platform! To activate your account, please use the verification code below:</p>
            
            <div class="code-box">
                <div class="code">{code}</div>
            </div>
            
            <p>This code will expire in <strong style="color: #ff4444;">10 minutes</strong>.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            
            <div class="warning">
                ⚠️ Never share this code with anyone. Our team will never ask for it.
            </div>
        </div>
        <div class="footer">
            <p>© 2026 Bug Bounty Platform | Red Team Operations</p>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
"""
