"""
JWT Authentication middleware for Supabase integration.

This middleware handles JWT token verification for incoming requests,
supporting both Supabase auth tokens and FastAPI tokens.
"""

import logging
from typing import Optional, Callable
from fastapi import Request, HTTPException, status
from fastapi.security.utils import get_authorization_scheme_param

from core.auth_enhanced import verify_supabase_jwt, decode_token
from core.exceptions import AuthenticationError

logger = logging.getLogger(__name__)


class JWTAuthMiddleware:
    """Middleware for JWT authentication."""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """Process incoming request."""
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        
        # Skip authentication for certain paths
        if self._should_skip_auth(request.url.path):
            await self.app(scope, receive, send)
            return
        
        # Extract and validate JWT token
        token = self._extract_token(request)
        if token:
            try:
                # Try to verify token and add user info to request state
                user_info = await self._verify_token(token)
                request.state.user = user_info
            except AuthenticationError as e:
                logger.warning(f"Authentication failed: {e}")
                # Let the endpoint handle authentication failure
                pass
        
        await self.app(scope, receive, send)
    
    def _should_skip_auth(self, path: str) -> bool:
        """
        Check if authentication should be skipped for this path.
        
        Args:
            path: Request path
            
        Returns:
            True if authentication should be skipped
        """
        skip_paths = [
            "/api/docs",
            "/api/redoc",
            "/api/openapi.json",
            "/api/health",
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh"
        ]
        
        return any(path.startswith(skip_path) for skip_path in skip_paths)
    
    def _extract_token(self, request: Request) -> Optional[str]:
        """
        Extract JWT token from request.
        
        Args:
            request: FastAPI request object
            
        Returns:
            JWT token or None
        """
        authorization = request.headers.get("Authorization")
        if not authorization:
            return None
        
        scheme, credentials = get_authorization_scheme_param(authorization)
        if scheme.lower() != "bearer":
            return None
        
        return credentials
    
    async def _verify_token(self, token: str) -> dict:
        """
        Verify JWT token.
        
        Args:
            token: JWT token to verify
            
        Returns:
            User information from token
            
        Raises:
            AuthenticationError: If token verification fails
        """
        # First try FastAPI token format
        try:
            token_data = decode_token(token)
            return {
                "user_id": token_data.sub,
                "token_type": "fastapi",
                "role": token_data.role,
                "scopes": token_data.scopes
            }
        except AuthenticationError:
            # Try Supabase token format
            try:
                supabase_payload = await verify_supabase_jwt(token)
                return {
                    "user_id": supabase_payload["sub"],
                    "token_type": "supabase",
                    "email": supabase_payload.get("email"),
                    "role": supabase_payload.get("role")
                }
            except AuthenticationError:
                raise AuthenticationError("Invalid token format")


def create_jwt_middleware() -> Callable:
    """
    Create JWT authentication middleware.
    
    Returns:
        Middleware function
    """
    return JWTAuthMiddleware
