#!/usr/bin/env python3
"""
CLI entry point for running project scripts.
This allows running scripts from the project root while maintaining proper imports.
"""

import sys
import argparse
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


def main():
    """Main CLI interface for project scripts"""
    parser = argparse.ArgumentParser(
        description="Run project scripts",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Available scripts:
  seed-data    Generate sample log data for development and testing

Examples:
  python scripts.py seed-data --count 1000 --days 30
  python scripts.py seed-data --clear --count 2000
        """.strip()
    )
    
    subparsers = parser.add_subparsers(dest='script', help='Available scripts')
    
    # Seed data subcommand
    seed_parser = subparsers.add_parser(
        'seed-data', 
        help='Generate sample log data',
        description='Generate sample log entries for testing and development'
    )
    seed_parser.add_argument(
        '--count', '-c', 
        type=int, 
        default=1000, 
        help='Number of log entries to create (default: 1000)'
    )
    seed_parser.add_argument(
        '--days', '-d', 
        type=int, 
        default=30, 
        help='Number of days back to generate data (default: 30)'
    )
    seed_parser.add_argument(
        '--clear', 
        action='store_true', 
        help='Clear existing data before seeding'
    )
    
    args = parser.parse_args()
    
    if not args.script:
        parser.print_help()
        sys.exit(1)
    
    if args.script == 'seed-data':
        from app.scripts.seed_data import main as seed_main
        # Pass arguments to the seed script
        sys.argv = ['seed_data.py']
        if hasattr(args, 'count'):
            sys.argv.extend(['--count', str(args.count)])
        if hasattr(args, 'days'):
            sys.argv.extend(['--days', str(args.days)])
        if hasattr(args, 'clear') and args.clear:
            sys.argv.append('--clear')
        
        seed_main()
    else:
        print(f"Unknown script: {args.script}")
        sys.exit(1)


if __name__ == "__main__":
    main()