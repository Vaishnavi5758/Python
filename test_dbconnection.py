import mysql.connector

# Replace with your actual database credentials
db_config = {
    "host": "localhost",
    "user": "vaishnavi",
    "password": "Suyogniwas57@",
    "database": "data_viz_dashboard"
}

try:
    conn = mysql.connector.connect(**db_config)
    if conn.is_connected():
        print("Database connection successful!")
    
    # Create a cursor and run a test query
    cursor = conn.cursor()
    cursor.execute("SELECT DATABASE();")
    db_name = cursor.fetchone()
    print("Connected to database:", db_name[0])

    cursor.close()
    conn.close()
except mysql.connector.Error as err:
    print("Error:", err)