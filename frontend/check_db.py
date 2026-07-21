import psycopg2

try:
    conn = psycopg2.connect(
        dbname="carbontrack",
        user="postgres",
        password="906630",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    
    # Hash for 'admin123'
    # Spring's BCryptPasswordEncoder can verify standard bcrypt hashes
    # Let's use a standard $2a$ format bcrypt hash just to be perfectly compatible:
    # 'admin123' -> $2a$10$8K1p/a0dL1t6Wc9ZqG.nOuWJ7u4X0i173LwXnpx/2hD1yB0x3t72y
    admin_hash = "$2a$10$8K1p/a0dL1t6Wc9ZqG.nOuWJ7u4X0i173LwXnpx/2hD1yB0x3t72y"
    
    # First, let's check if admin@carbontrack.com exists
    cursor.execute("SELECT id FROM users WHERE email = 'admin@carbontrack.com';")
    row = cursor.fetchone()
    
    if row:
        # Update existing user
        cursor.execute(
            "UPDATE users SET role = 'ADMIN', password = %s, name = 'Super Admin' WHERE email = 'admin@carbontrack.com';",
            (admin_hash,)
        )
        print("Updated existing user admin@carbontrack.com to ADMIN role and password to 'admin123'")
    else:
        # Insert new user
        cursor.execute(
            "INSERT INTO users (name, email, password, role, preferred_units, goal_visibility) VALUES ('Super Admin', 'admin@carbontrack.com', %s, 'ADMIN', 'metric', 'private');",
            (admin_hash,)
        )
        print("Inserted new user admin@carbontrack.com with ADMIN role and password 'admin123'")
        
    conn.commit()
    cursor.close()
    conn.close()
except Exception as e:
    print("Database error:", e)
