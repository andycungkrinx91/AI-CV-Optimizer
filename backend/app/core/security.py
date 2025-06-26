from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from .config import settings

# This tells FastAPI to look for an "Authorization" header with a "Bearer" token.
security_scheme = HTTPBearer()

def verify_token(credentials: str = Depends(security_scheme)):
    """
    A dependency that verifies the provided bearer token against the secret token
    stored in the application settings.
    """
    # The `credentials` object has an attribute 'credentials' which holds the token string.
    token = credentials.credentials
    
    if token != settings.API_AUTH_TOKEN:
        # If the token doesn't match our secret token, reject the request.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired token. You do not have permission to access this resource.",
        )
    return token