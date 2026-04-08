import psycopg2

# Database connection
conn_string = "postgresql://bugbounty_user:postgresqlBugBounty1234_Isma@72.60.151.201:5432/bugbounty_db"

try:
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    
    print("Connecting to database...")
    
    # Add verification columns
    print("Adding is_verified column...")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE NOT NULL")
    
    print("Adding verification_code column...")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6)")
    
    print("Adding code_expires_at column...")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE")
    
    print("Adding verification_attempts column...")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0 NOT NULL")
    
    # Update existing users to be verified (backward compatibility)
    print("Updating existing users to verified status...")
    cur.execute("UPDATE users SET is_verified = TRUE WHERE verification_code IS NULL")
    
    conn.commit()
    print("\n✓ Migration completed successfully!")
    print("✓ All verification columns added to users table")
    print("✓ Existing users marked as verified")
    
    # Verify columns exist
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name IN ('is_verified', 'verification_code', 'code_expires_at', 'verification_attempts')
        ORDER BY column_name
    """)
    
    print("\n📋 Verification columns:")
    for row in cur.fetchall():
        print(f"  - {row[0]}: {row[1]} (nullable: {row[2]}, default: {row[3]})")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    if conn:
        conn.rollback()
