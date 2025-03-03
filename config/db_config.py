import mysql.connector

# Database configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "vaishnavi",
    "password": "Suyogniwas57@",
    "database": "data_viz_dashboard"
}

# Function to establish a database connection
def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
    