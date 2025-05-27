"""
Exception handling for the ESAL Platform API.

This module defines custom exceptions and handlers for the FastAPI application.
"""
from typing import Dict, Any, Type, Callable, Union, List
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException, RequestValidationError
from pydantic import ValidationError

logger = logging.getLogger(__name__)


class AppException(Exception):
    """
    Base exception class for application-specific exceptions.
    
    Attributes:
        message: Human-readable error message
        status_code: HTTP status code
        code: Application-specific error code
        details: Additional error details
    """
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        code: str = "internal_error",
        details: Union[Dict[str, Any], List[Dict[str, Any]], None] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details
        super().__init__(self.message)


class NotFoundError(AppException):
    """Exception for resource not found errors."""
    
    def __init__(
        self,
        message: str = "Requested resource not found",
        code: str = "not_found",
        details: Union[Dict[str, Any], List[Dict[str, Any]], None] = None,
    ):
        super().__init__(message, status_code=404, code=code, details=details)


class ValidationError(AppException):
    """Exception for validation errors."""
    
    def __init__(
        self,
        message: str = "Validation error",
        code: str = "validation_error",
        details: Union[Dict[str, Any], List[Dict[str, Any]], None] = None,
    ):
        super().__init__(message, status_code=422, code=code, details=details)


class AuthenticationError(AppException):
    """Exception for authentication errors."""
    
    def __init__(
        self,
        message: str = "Authentication failed",
        code: str = "authentication_error",
        details: Union[Dict[str, Any], List[Dict[str, Any]], None] = None,
    ):
        super().__init__(message, status_code=401, code=code, details=details)


class AuthorizationError(AppException):
    """Exception raised for authorization/permission errors."""
    
    def __init__(
        self,
        message: str = "Access denied",
        details: Dict[str, Any] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            code="authorization_error",
            details=details or {}
        )


class RateLimitError(AppException):
    """Exception for rate limit errors."""
    
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        code: str = "rate_limit_exceeded",
        details: Union[Dict[str, Any], List[Dict[str, Any]], None] = None,
    ):
        super().__init__(message, status_code=429, code=code, details=details)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    Handle application-specific exceptions.
    
    Args:
        request: FastAPI request
        exc: AppException instance
        
    Returns:
        JSON response with error details
    """
    # Log the error with request details
    logger.error(
        f"AppException: {exc.message}",
        extra={
            "request_id": getattr(request.state, "request_id", None),
            "status_code": exc.status_code,
            "error_code": exc.code,
            "details": exc.details,
            "path": request.url.path,
        },
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "request_id": getattr(request.state, "request_id", None),
            }
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle FastAPI HTTPException.
    
    Args:
        request: FastAPI request
        exc: HTTPException instance
        
    Returns:
        JSON response with error details
    """
    logger.error(
        f"HTTPException: {exc.detail}",
        extra={
            "request_id": getattr(request.state, "request_id", None),
            "status_code": exc.status_code,
            "path": request.url.path,
        },
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "http_error",
                "message": str(exc.detail),
                "request_id": getattr(request.state, "request_id", None),
            }
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle request validation errors.
    
    Args:
        request: FastAPI request
        exc: RequestValidationError instance
        
    Returns:
        JSON response with error details
    """
    # Format validation errors in a user-friendly way
    errors = []
    for error in exc.errors():
        error_location = " -> ".join([str(loc) for loc in error["loc"]])
        errors.append({
            "field": error_location,
            "message": error["msg"],
            "type": error["type"],
        })
    
    logger.warning(
        "Validation error",
        extra={
            "request_id": getattr(request.state, "request_id", None),
            "validation_errors": errors,
            "path": request.url.path,
        },
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "validation_error",
                "message": "Request validation failed",
                "details": errors,
                "request_id": getattr(request.state, "request_id", None),
            }
        },
    )


async def pydantic_validation_exception_handler(
    request: Request, exc: ValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors.
    
    Args:
        request: FastAPI request
        exc: ValidationError instance
        
    Returns:
        JSON response with error details
    """
    # Format validation errors in a user-friendly way
    errors = []
    for error in exc.errors():
        error_location = " -> ".join([str(loc) for loc in error["loc"]])
        errors.append({
            "field": error_location,
            "message": error["msg"],
            "type": error["type"],
        })
    
    logger.warning(
        "Pydantic validation error",
        extra={
            "request_id": getattr(request.state, "request_id", None),
            "validation_errors": errors,
            "path": request.url.path,
        },
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "validation_error",
                "message": "Data validation failed",
                "details": errors,
                "request_id": getattr(request.state, "request_id", None),
            }
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions.
    
    Args:
        request: FastAPI request
        exc: Any unhandled exception
        
    Returns:
        JSON response with error details
    """
    logger.exception(
        f"Unhandled exception: {str(exc)}",
        extra={
            "request_id": getattr(request.state, "request_id", None),
            "path": request.url.path,
        },
        exc_info=exc,
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "internal_server_error",
                "message": "An unexpected error occurred",
                "request_id": getattr(request.state, "request_id", None),
            }
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all exception handlers with the FastAPI app.
    
    Args:
        app: FastAPI application instance
    """
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(ValidationError, pydantic_validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
