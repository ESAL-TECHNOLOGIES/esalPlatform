"""
Logging configuration for the ESAL Platform API.

This module sets up structured logging with appropriate handlers 
based on the environment.
"""
import logging
import sys
import json
from typing import Any, Dict
from datetime import datetime
import logging.config

from core.config import settings


class JsonFormatter(logging.Formatter):
    """
    JSON formatter for structured logging.
    
    This formatter outputs logs in a standard JSON format that can be
    easily parsed by logging systems like ELK or Datadog.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON.
        
        Args:
            record: LogRecord instance
            
        Returns:
            JSON-formatted log string
        """
        log_data = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "service": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
        }
        
        # Add extra fields from record
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add any extra attributes from the LogRecord
        for key, value in record.__dict__.items():
            if key not in [
                "timestamp", "level", "message", "logger", "module",
                "function", "line", "service", "environment", "request_id",
                "exc_info", "exc_text", "stack_info", "lineno", "funcName",
                "created", "msecs", "relativeCreated", "levelname", "levelno",
                "pathname", "filename", "name", "thread", "threadName",
                "processName", "process", "args", "msg"
            ]:
                log_data[key] = value
        
        return json.dumps(log_data)


def setup_logging() -> None:
    """
    Configure application logging based on the environment.
    """
    log_level = getattr(logging, settings.LOG_LEVEL)
    
    if settings.ENVIRONMENT == "dev":
        # Development logging configuration
        config = {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "level": log_level,
                    "formatter": "default",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": log_level,
                "handlers": ["console"],
            },
        }
    else:
        # Production/Staging logging with JSON formatter
        config = {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "json": {
                    "()": JsonFormatter,
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "level": log_level,
                    "formatter": "json",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": log_level,
                "handlers": ["console"],
            },
        }
    
    # Apply the configuration
    logging.config.dictConfig(config)
    
    # Log the configuration
    logger = logging.getLogger(__name__)
    logger.debug(f"Logging configured with level {settings.LOG_LEVEL}")


class RequestIdFilter(logging.Filter):
    """Filter that adds request_id to log records."""
    
    def __init__(self, request_id: str):
        super().__init__()
        self.request_id = request_id
    
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = self.request_id
        return True
