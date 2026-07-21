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
    
    print("--- USERS ---")
    cursor.execute("SELECT id, name, email, role, org_id FROM users;")
    for row in cursor.fetchall():
        print(f"ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Role: {row[3]}, OrgId: {row[4]}")
        
    print("\n--- ORGANISATIONS ---")
    cursor.execute("SELECT id, name, admin_user_id FROM organisations;")
    for row in cursor.fetchall():
        print(f"ID: {row[0]}, Name: {row[1]}, AdminUserId: {row[2]}")
        
    print("\n--- GOALS ---")
    cursor.execute("SELECT id, org_id, description, target_value, current_value FROM organisation_goals;")
    for row in cursor.fetchall():
         print(f"ID: {row[0]}, OrgId: {row[1]}, Desc: {row[2]}, Target: {row[3]}, Current: {row[4]}")

    print("\n--- CHALLENGES ---")
    cursor.execute("SELECT id, org_id, title, department_a, department_b FROM organisation_challenges;")
    for row in cursor.fetchall():
         print(f"ID: {row[0]}, OrgId: {row[1]}, Title: {row[2]}, DeptA: {row[3]}, DeptB: {row[4]}")

    cursor.close()
    conn.close()
except Exception as e:
    print("Database error:", e)
