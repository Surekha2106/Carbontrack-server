import psycopg2
from datetime import date, timedelta

try:
    conn = psycopg2.connect(
        dbname="carbontrack",
        user="postgres",
        password="906630",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()

    # 1. Create Organisation
    cursor.execute("SELECT id FROM organisations WHERE name = 'Acme Corporation';")
    org_row = cursor.fetchone()
    if org_row:
        org_id = org_row[0]
        print(f"Organisation 'Acme Corporation' already exists with ID: {org_id}")
    else:
        cursor.execute("INSERT INTO organisations (name) VALUES ('Acme Corporation') RETURNING id;")
        org_id = cursor.fetchone()[0]
        print(f"Created organisation 'Acme Corporation' with ID: {org_id}")

    admin_hash = "$2a$10$8K1p/a0dL1t6Wc9ZqG.nOuWJ7u4X0i173LwXnpx/2hD1yB0x3t72y" # admin123

    # 2. Upsert Org Admin
    cursor.execute("SELECT id FROM users WHERE email = 'orgadmin@carbontrack.com';")
    admin_user_row = cursor.fetchone()
    if admin_user_row:
        admin_user_id = admin_user_row[0]
        cursor.execute(
            "UPDATE users SET name='Acme Admin', role='ORG_ADMIN', org_id=%s, department='Management', password=%s WHERE id=%s;",
            (org_id, admin_hash, admin_user_id)
        )
        print("Updated existing user orgadmin@carbontrack.com")
    else:
        cursor.execute(
            "INSERT INTO users (name, email, password, role, org_id, department, preferred_units, goal_visibility) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;",
            ("Acme Admin", "orgadmin@carbontrack.com", admin_hash, "ORG_ADMIN", org_id, "Management", "metric", "public")
        )
        admin_user_id = cursor.fetchone()[0]
        print("Created orgadmin@carbontrack.com")

    # Update organisation's admin_user_id
    cursor.execute("UPDATE organisations SET admin_user_id = %s WHERE id = %s;", (admin_user_id, org_id))

    # 3. Upsert Employee 1 (Engineering)
    cursor.execute("SELECT id FROM users WHERE email = 'employee@carbontrack.com';")
    emp1_row = cursor.fetchone()
    if emp1_row:
        emp1_id = emp1_row[0]
        cursor.execute(
            "UPDATE users SET name='Jane Employee', role='USER', org_id=%s, department='Engineering', password=%s WHERE id=%s;",
            (org_id, admin_hash, emp1_id)
        )
        print("Updated existing user employee@carbontrack.com")
    else:
        cursor.execute(
            "INSERT INTO users (name, email, password, role, org_id, department, preferred_units, goal_visibility) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;",
            ("Jane Employee", "employee@carbontrack.com", admin_hash, "USER", org_id, "Engineering", "metric", "public")
        )
        emp1_id = cursor.fetchone()[0]
        print("Created employee@carbontrack.com")

    # 4. Upsert Employee 2 (Sales)
    cursor.execute("SELECT id FROM users WHERE email = 'sales_emp@carbontrack.com';")
    emp2_row = cursor.fetchone()
    if emp2_row:
        emp2_id = emp2_row[0]
        cursor.execute(
            "UPDATE users SET name='Bob Sales', role='USER', org_id=%s, department='Sales', password=%s WHERE id=%s;",
            (org_id, admin_hash, emp2_id)
        )
        print("Updated existing user sales_emp@carbontrack.com")
    else:
        cursor.execute(
            "INSERT INTO users (name, email, password, role, org_id, department, preferred_units, goal_visibility) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;",
            ("Bob Sales", "sales_emp@carbontrack.com", admin_hash, "USER", org_id, "Sales", "metric", "public")
        )
        emp2_id = cursor.fetchone()[0]
        print("Created sales_emp@carbontrack.com")

    # 5. Populate some activities
    cursor.execute("DELETE FROM activity_logs WHERE user_id IN (%s, %s, %s);", (admin_user_id, emp1_id, emp2_id))
    
    today = date.today()
    # Let's add activity logs over the last 15 days
    for i in range(15):
        log_date = today - timedelta(days=i)
        # Admin activity
        cursor.execute(
            "INSERT INTO activity_logs (user_id, category, activity_type, quantity, unit, emission, log_date) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (admin_user_id, "Transport", "transport", 10.0, "km", 2.0, log_date)
        )
        cursor.execute(
            "INSERT INTO activity_logs (user_id, category, activity_type, quantity, unit, emission, log_date) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (admin_user_id, "Electricity", "energy", 5.0, "kWh", 2.5, log_date)
        )
        # Employee 1 (Jane - Engineering)
        cursor.execute(
            "INSERT INTO activity_logs (user_id, category, activity_type, quantity, unit, emission, log_date) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (emp1_id, "Transport", "transport", 15.0, "km", 3.0, log_date)
        )
        cursor.execute(
            "INSERT INTO activity_logs (user_id, category, activity_type, quantity, unit, emission, log_date) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (emp1_id, "Food", "food", 2.0, "meal", 4.0, log_date)
        )
        # Employee 2 (Bob - Sales)
        cursor.execute(
            "INSERT INTO activity_logs (user_id, category, activity_type, quantity, unit, emission, log_date) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (emp2_id, "Transport", "transport", 25.0, "km", 5.0, log_date)
        )
        cursor.execute(
            "INSERT INTO activity_logs (user_id, category, activity_type, quantity, unit, emission, log_date) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (emp2_id, "Shopping", "shopping", 1.0, "item", 5.0, log_date)
        )

    # 6. Setup Goals
    cursor.execute("DELETE FROM organisation_goals WHERE org_id = %s;", (org_id,))
    cursor.execute(
        "INSERT INTO organisation_goals (org_id, description, target_value, current_value, start_date, end_date) VALUES (%s, %s, %s, %s, %s, %s);",
        (org_id, "Reduce travel emissions by 20%", 100.0, 45.0, today - timedelta(days=30), today + timedelta(days=60))
    )
    cursor.execute(
        "INSERT INTO organisation_goals (org_id, description, target_value, current_value, start_date, end_date) VALUES (%s, %s, %s, %s, %s, %s);",
        (org_id, "Implement green energy savings program", 50.0, 12.5, today - timedelta(days=15), today + timedelta(days=75))
    )

    # 7. Setup Challenges
    cursor.execute("DELETE FROM organisation_challenges WHERE org_id = %s;", (org_id,))
    cursor.execute(
        "INSERT INTO organisation_challenges (org_id, title, description, department_a, department_b, emissions_a, emissions_b, end_date) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);",
        (org_id, "Engineering vs Sales: Commute Challenge", "Which department can maintain the lowest travel footprint this month?", "Engineering", "Sales", 45.5, 62.0, today + timedelta(days=15))
    )

    conn.commit()
    cursor.close()
    conn.close()
    print("Database successfully seeded for Acme Corporation!")
except Exception as e:
    print("Database seeding error:", e)
