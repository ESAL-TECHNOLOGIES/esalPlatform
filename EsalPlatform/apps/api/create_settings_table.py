#!/usr/bin/env python3
"""
Create system settings table in the database
"""

import sqlite3
import os
import sys

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_settings_table():
    """Create the system_settings table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "esal_dev.db")
    
    print(f"Creating settings table in database: {db_path}")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create system_settings table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT NOT NULL,
            setting_type TEXT NOT NULL DEFAULT 'string',
            category TEXT NOT NULL DEFAULT 'general',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        print("✅ Created system_settings table")
        
        # Insert default settings
        default_settings = [
            # General settings
            ('platform_name', 'ESAL Platform', 'string', 'general', 'Name of the platform'),
            ('maintenance_mode', 'false', 'boolean', 'general', 'Enable/disable maintenance mode'),
            ('registration_enabled', 'true', 'boolean', 'general', 'Allow new user registrations'),
            ('max_file_size', '10MB', 'string', 'general', 'Maximum file upload size'),
            
            # Security settings
            ('session_timeout', '30', 'number', 'security', 'Session timeout in minutes'),
            ('password_requirements', 'Strong', 'string', 'security', 'Password strength requirements'),
            ('two_factor_enabled', 'false', 'boolean', 'security', 'Enable two-factor authentication'),
            ('ip_whitelist_enabled', 'false', 'boolean', 'security', 'Enable IP whitelist'),
            
            # Notification settings
            ('email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications'),
            ('sms_notifications', 'false', 'boolean', 'notifications', 'Enable SMS notifications'),
            ('push_notifications', 'true', 'boolean', 'notifications', 'Enable push notifications'),
            
            # Integration settings
            ('aws_s3_enabled', 'false', 'boolean', 'integrations', 'Enable AWS S3 storage'),
            ('aws_s3_bucket', '', 'string', 'integrations', 'AWS S3 bucket name'),
            ('aws_access_key', '', 'string', 'integrations', 'AWS access key'),
            ('openai_enabled', 'false', 'boolean', 'integrations', 'Enable OpenAI integration'),
            ('openai_api_key', '', 'string', 'integrations', 'OpenAI API key'),
            ('email_provider', 'smtp', 'string', 'integrations', 'Email provider type'),
            ('smtp_host', '', 'string', 'integrations', 'SMTP host'),
            ('smtp_port', '587', 'number', 'integrations', 'SMTP port'),
            ('smtp_username', '', 'string', 'integrations', 'SMTP username'),
            ('backup_enabled', 'true', 'boolean', 'integrations', 'Enable automatic backups'),
            ('backup_frequency', 'daily', 'string', 'integrations', 'Backup frequency'),
            ('analytics_enabled', 'true', 'boolean', 'integrations', 'Enable analytics tracking'),
        ]
        
        # Insert default settings if they don't exist
        for setting in default_settings:
            cursor.execute("""
            INSERT OR IGNORE INTO system_settings 
            (setting_key, setting_value, setting_type, category, description) 
            VALUES (?, ?, ?, ?, ?)
            """, setting)
        
        print("✅ Inserted default settings")
        
        # Commit changes
        conn.commit()
        print("✅ Settings table created and populated successfully!")
        
        # Show created settings
        cursor.execute("SELECT setting_key, setting_value, category FROM system_settings ORDER BY category, setting_key")
        settings = cursor.fetchall()
        
        print("\n📋 Created settings:")
        current_category = None
        for key, value, category in settings:
            if category != current_category:
                print(f"\n{category.upper()}:")
                current_category = category
            print(f"  {key}: {value}")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        conn.close()
    
    return True

if __name__ == "__main__":
    success = create_settings_table()
    if success:
        print("\n🎉 Settings table setup completed!")
    else:
        print("\n💥 Settings table setup failed!")
        sys.exit(1)
