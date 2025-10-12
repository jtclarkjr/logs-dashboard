"""
Database error analysis module

This module provides pattern-based database error analysis to convert raw database
errors into user-friendly messages with helpful suggestions.
"""
from dataclasses import dataclass
from typing import Any, Dict, Optional, List, Callable
import re

@dataclass
class ErrorPattern:
    """Represents a database error pattern with its detection logic and response"""
    name: str
    category: str
    keywords: List[str]
    message_template: str
    suggestion: str
    custom_handler: Optional[Callable[[str, str], Dict[str, Any]]] = None


class DatabaseErrorAnalyzer:
    """Handles database error analysis using a pattern-based approach"""
    
    def __init__(self):
        self.patterns = [
            # Datetime/timezone errors (highest priority)
            ErrorPattern(
                name="datetime_timezone_mismatch",
                category="datetime_timezone_mismatch", 
                keywords=["offset-naive", "offset-aware"],
                message_template="Date/time format error during {operation}: Can't compare offset-naive and offset-aware datetimes.",
                suggestion="Ensure all datetime values include timezone information or are consistently timezone-naive."
            ),
            ErrorPattern(
                name="datetime_format_error",
                category="datetime_format_error",
                keywords=["datetime", "timezone", "offset"],
                message_template="Date/time validation error during {operation}: {error}",
                suggestion="Check that all date/time values are properly formatted."
            ),
            
            # Connection errors
            ErrorPattern(
                name="connection_timeout",
                category="connection_timeout",
                keywords=["timeout"],
                message_template="Database connection timeout during {operation}. The database may be overloaded.",
                suggestion="Try again in a moment. If this persists, contact system administrator."
            ),
            ErrorPattern(
                name="connection_refused",
                category="connection_refused",
                keywords=["refused"],
                message_template="Database connection refused during {operation}. Database service may be unavailable.",
                suggestion="Check if the database service is running."
            ),
            ErrorPattern(
                name="connection_failed",
                category="connection_failed",
                keywords=["connection", "connect"],
                message_template="Failed to connect to database during {operation}. Database may be unavailable.",
                suggestion="Check database connectivity and try again."
            ),
            
            # Constraint violations
            ErrorPattern(
                name="duplicate_entry",
                category="duplicate_entry",
                keywords=["unique", "duplicate"],
                message_template="Data conflict during {operation}: A record with this information already exists.",
                suggestion="Check if a similar record already exists or modify the data to make it unique.",
                custom_handler=self._handle_constraint_violation
            ),
            ErrorPattern(
                name="constraint_violation",
                category="constraint_violation",
                keywords=["constraint", "violates"],
                message_template="Data validation failed during {operation}: The data violates database rules.",
                suggestion="Verify all required fields are provided and data meets format requirements."
            ),
            
            # Permission errors
            ErrorPattern(
                name="access_denied",
                category="access_denied",
                keywords=["permission", "denied", "access", "unauthorized"],
                message_template="Database access denied during {operation}. Insufficient permissions.",
                suggestion="Contact system administrator to check database permissions."
            ),
            
            # Syntax/query errors
            ErrorPattern(
                name="query_error",
                category="query_error",
                keywords=["syntax", "invalid", "malformed", "parse"],
                message_template="Database query error during {operation}. Invalid database operation.",
                suggestion="This appears to be a system error. Please contact support."
            ),
            
            # Resource errors
            ErrorPattern(
                name="storage_full",
                category="storage_full",
                keywords=["disk", "space"],
                message_template="Database storage full during {operation}. Insufficient disk space.",
                suggestion="Contact system administrator - database storage needs attention."
            ),
            ErrorPattern(
                name="resource_limit",
                category="resource_limit",
                keywords=["memory", "limit", "quota"],
                message_template="Database resource limit exceeded during {operation}.",
                suggestion="Try again later or contact system administrator."
            ),
            
            # Transaction/lock errors
            ErrorPattern(
                name="concurrency_conflict",
                category="concurrency_conflict",
                keywords=["deadlock", "lock", "transaction", "serialization"],
                message_template="Database concurrency conflict during {operation}. Multiple operations interfered with each other.",
                suggestion="Try the operation again - this is usually temporary."
            )
        ]
    
    def _handle_constraint_violation(self, error_str: str, operation: str) -> Dict[str, Any]:
        """Handle constraint violation errors with constraint name extraction"""
        constraint_match = re.search(r'constraint "([^"]+)"', error_str)
        constraint_name = constraint_match.group(1) if constraint_match else 'unknown'
        return {"constraint": constraint_name}
    
    def _matches_pattern(self, pattern: ErrorPattern, error_str: str) -> bool:
        """Check if error string matches the given pattern"""
        if pattern.name == "datetime_timezone_mismatch":
            # Special case: requires both keywords to be present
            return all(keyword in error_str for keyword in pattern.keywords)
        else:
            # Regular case: any keyword match
            return any(keyword in error_str for keyword in pattern.keywords)
    
    def analyze(self, error: Exception, operation: str) -> tuple[str, Dict[str, Any]]:
        """Analyze database error and provide specific error message and details"""
        error_str = str(error).lower()
        error_details = {"operation": operation, "error_type": type(error).__name__}
        
        # Try to match against known patterns
        for pattern in self.patterns:
            if self._matches_pattern(pattern, error_str):
                message = pattern.message_template.format(operation=operation, error=str(error))
                
                error_details.update({
                    "error_category": pattern.category,
                    "suggestion": pattern.suggestion,
                    "original_error": str(error)
                })
                
                # Apply custom handler if available
                if pattern.custom_handler:
                    additional_details = pattern.custom_handler(error_str, operation)
                    error_details.update(additional_details)
                
                return message, error_details
        
        # Fallback for unknown errors
        message = f"Unexpected database error during {operation}: {str(error)[:100]}..."
        error_details.update({
            "error_category": "unknown",
            "original_error": str(error),
            "suggestion": "Please try again or contact support if the problem persists."
        })
        
        return message, error_details


# Global analyzer instance
_error_analyzer = DatabaseErrorAnalyzer()


def analyze_database_error(error: Exception, operation: str) -> tuple[str, Dict[str, Any]]:
    """Analyze database error and provide specific error message and details"""
    return _error_analyzer.analyze(error, operation)
