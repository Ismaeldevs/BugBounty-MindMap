"""
Cloudflare Turnstile verification service.
Validates tokens to prevent bot registrations.
"""
import httpx
import logging
from typing import Dict, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile_token(token: str, remote_ip: Optional[str] = None) -> bool:
    """
    Verify Cloudflare Turnstile token.
    
    Args:
        token: The Turnstile response token from frontend
        remote_ip: Optional user IP address for additional validation
    
    Returns:
        bool: True if token is valid, False otherwise
    """
    # Skip verification if Turnstile is disabled (development mode)
    if not settings.TURNSTILE_ENABLED:
        logger.info("Turnstile verification skipped (disabled in settings)")
        return True
    
    if not settings.TURNSTILE_SECRET_KEY:
        logger.error("Turnstile secret key not configured")
        return False
    
    try:
        payload: Dict[str, str] = {
            "secret": settings.TURNSTILE_SECRET_KEY,
            "response": token,
        }
        
        if remote_ip:
            payload["remoteip"] = remote_ip
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                TURNSTILE_VERIFY_URL,
                data=payload,
                timeout=10.0
            )
            
            if response.status_code != 200:
                logger.error(f"Turnstile API error: {response.status_code}")
                return False
            
            result = response.json()
            
            if result.get("success"):
                logger.info("Turnstile verification successful")
                return True
            else:
                error_codes = result.get("error-codes", [])
                logger.warning(f"Turnstile verification failed: {error_codes}")
                return False
                
    except httpx.TimeoutException:
        logger.error("Turnstile verification timeout")
        return False
    except Exception as e:
        logger.error(f"Turnstile verification error: {str(e)}")
        return False


def get_client_ip(request) -> Optional[str]:
    """
    Extract client IP from request headers.
    
    Args:
        request: FastAPI Request object
    
    Returns:
        Optional[str]: Client IP address or None
    """
    # Check common headers for real IP (behind proxies)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client IP
    if request.client:
        return request.client.host
    
    return None
