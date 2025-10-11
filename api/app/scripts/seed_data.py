#!/usr/bin/env python3
"""
Sample data seeding script for the Logs Dashboard API
Creates sample log entries for testing and development purposes.
"""

import sys
import os
from datetime import datetime, timedelta
from random import choice, randint
from app.core.database import SessionLocal, create_tables
from app.models.log import LogEntry, SeverityLevel

# Sample data for generating logs
SAMPLE_MESSAGES = {
    SeverityLevel.DEBUG: [
        "Database connection pool initialized",
        "Cache warming started",
        "Processing request with ID: {}",
        "User authentication token validated",
        "Configuration loaded successfully",
        "Background task scheduled",
        "Memory usage: {}MB",
        "Request processing time: {}ms"
    ],
    SeverityLevel.INFO: [
        "Application started successfully",
        "New user registration: user_{}",
        "File upload completed: {}",
        "Email sent to user@example.com",
        "Scheduled backup completed",
        "System health check passed",
        "API endpoint called: /api/v1/{}",
        "Session created for user: {}",
        "Data synchronization completed",
        "Report generated successfully"
    ],
    SeverityLevel.WARNING: [
        "High memory usage detected: {}MB",
        "Slow database query detected: {}ms",
        "Rate limit threshold reached for IP: {}",
        "Disk space running low: {}% used",
        "Connection timeout occurred",
        "Invalid request parameter: {}",
        "Cache miss rate high: {}%",
        "SSL certificate expires in {} days",
        "Queue size growing: {} items",
        "Deprecated API endpoint accessed"
    ],
    SeverityLevel.ERROR: [
        "Database connection failed",
        "Failed to send email to user@example.com",
        "File upload failed: invalid format",
        "Authentication failed for user: {}",
        "Payment processing error: transaction_{}",
        "API request failed with status: {}",
        "Unable to connect to external service",
        "Data validation error: missing field {}",
        "Session expired for user: {}",
        "Configuration file not found"
    ],
    SeverityLevel.CRITICAL: [
        "Database server is down",
        "System out of memory",
        "Security breach detected from IP: {}",
        "Payment gateway is unresponsive",
        "Data corruption detected in table: {}",
        "Multiple service failures detected",
        "System overload: {} concurrent users",
        "Backup restoration failed",
        "Critical security vulnerability found",
        "Service unavailable: maintenance required"
    ]
}

SAMPLE_SOURCES = [
    "api-server",
    "web-frontend",
    "database",
    "authentication",
    "payment-gateway",
    "email-service",
    "file-storage",
    "analytics",
    "monitoring",
    "background-jobs",
    "cache-service",
    "user-service",
    "notification-service",
    "reporting",
    "security"
]

def generate_sample_data(num_logs: int = 1000, days_back: int = 30):
    """Generate sample log entries"""
    
    db = SessionLocal()
    try:
        # Create tables if they don't exist
        create_tables()
        
        print(f"Generating {num_logs} sample log entries over the last {days_back} days...")
        
        logs = []
        start_time = datetime.utcnow() - timedelta(days=days_back)
        
        for i in range(num_logs):
            # Generate random timestamp within the date range
            random_seconds = randint(0, int(timedelta(days=days_back).total_seconds()))
            timestamp = start_time + timedelta(seconds=random_seconds)
            
            # Choose random severity (with weighted distribution)
            severity_weights = {
                SeverityLevel.DEBUG: 30,
                SeverityLevel.INFO: 40,
                SeverityLevel.WARNING: 20,
                SeverityLevel.ERROR: 8,
                SeverityLevel.CRITICAL: 2
            }
            
            severity = choice([
                severity for severity, weight in severity_weights.items()
                for _ in range(weight)
            ])
            
            # Choose random source
            source = choice(SAMPLE_SOURCES)
            
            # Generate message based on severity
            message_template = choice(SAMPLE_MESSAGES[severity])
            
            # Fill in placeholders in message templates
            if "{}" in message_template:
                if "ID:" in message_template or "user_" in message_template:
                    message = message_template.format(randint(1000, 9999))
                elif "MB" in message_template:
                    message = message_template.format(randint(100, 2000))
                elif "ms" in message_template:
                    message = message_template.format(randint(50, 5000))
                elif "%" in message_template:
                    message = message_template.format(randint(60, 95))
                elif "IP:" in message_template:
                    ip = f"{randint(1,255)}.{randint(1,255)}.{randint(1,255)}.{randint(1,255)}"
                    message = message_template.format(ip)
                elif "status:" in message_template:
                    status = choice([400, 401, 403, 404, 500, 502, 503])
                    message = message_template.format(status)
                elif "days" in message_template:
                    message = message_template.format(randint(1, 30))
                elif "items" in message_template:
                    message = message_template.format(randint(100, 10000))
                elif "users" in message_template:
                    message = message_template.format(randint(1000, 50000))
                elif "table:" in message_template:
                    table = choice(["users", "logs", "transactions", "sessions", "products"])
                    message = message_template.format(table)
                elif "field" in message_template:
                    field = choice(["email", "password", "username", "phone", "address"])
                    message = message_template.format(field)
                elif "transaction_" in message_template:
                    message = message_template.format(randint(100000, 999999))
                else:
                    message = message_template.format(randint(1, 1000))
            else:
                message = message_template
            
            # Create log entry
            log_entry = LogEntry(
                timestamp=timestamp,
                message=message,
                severity=severity,
                source=source
            )
            
            logs.append(log_entry)
            
            # Batch insert every 100 records for better performance
            if len(logs) >= 100:
                db.add_all(logs)
                db.commit()
                print(f"Inserted {i+1}/{num_logs} records...")
                logs = []
        
        # Insert remaining records
        if logs:
            db.add_all(logs)
            db.commit()
        
        print(f"Successfully created {num_logs} sample log entries!")
        
        # Print summary statistics
        print("\nSample data summary:")
        for severity in SeverityLevel:
            count = db.query(LogEntry).filter(LogEntry.severity == severity).count()
            print(f"  {severity.value}: {count} logs")
        
        total_sources = db.query(LogEntry.source).distinct().count()
        print(f"  Total unique sources: {total_sources}")
        
        earliest = db.query(LogEntry).order_by(LogEntry.timestamp).first()
        latest = db.query(LogEntry).order_by(LogEntry.timestamp.desc()).first()
        
        if earliest and latest:
            print(f"  Date range: {earliest.timestamp.strftime('%Y-%m-%d')} to {latest.timestamp.strftime('%Y-%m-%d')}")
    
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
        return False
    
    finally:
        db.close()
    
    return True

def clear_existing_data():
    """Clear all existing log entries"""
    db = SessionLocal()
    try:
        count = db.query(LogEntry).count()
        if count > 0:
            response = input(f"This will delete all {count} existing log entries. Continue? (y/N): ")
            if response.lower() == 'y':
                db.query(LogEntry).delete()
                db.commit()
                print(f"Deleted {count} existing log entries.")
                return True
            else:
                print("Cancelled.")
                return False
        else:
            print("No existing data to clear.")
            return True
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    """Main function with command line arguments"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed the logs database with sample data")
    parser.add_argument("--count", "-c", type=int, default=1000, help="Number of log entries to create (default: 1000)")
    parser.add_argument("--days", "-d", type=int, default=30, help="Number of days back to generate data (default: 30)")
    parser.add_argument("--clear", action="store_true", help="Clear existing data before seeding")
    
    args = parser.parse_args()
    
    print("Logs Dashboard API - Sample Data Seeder")
    print("=" * 40)
    
    if args.clear:
        if not clear_existing_data():
            sys.exit(1)
    
    success = generate_sample_data(args.count, args.days)
    
    if success:
        print("\nSample data seeding completed successfully!")
        print("You can now start the API and explore the data at http://localhost:8000/docs")
    else:
        print("\nSample data seeding failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()