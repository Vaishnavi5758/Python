from flask import Flask, render_template, jsonify
from config.db_config import get_db_connection

app = Flask(__name__, template_folder="templates")

@app.route('/data', methods=['GET'])
def fetch_data():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)

        # Fetch all data
        cursor.execute("SELECT * FROM data_table")  # Replace with your actual table name
        data = cursor.fetchall()

        # Calculate sector-wise counts safely
        sector_counts = {}
        for row in data:
            sector = row.get("sector") or "Unknown"  # Handle None values
            sector_counts[sector] = sector_counts.get(sector, 0) + 1

        cursor.close()
        conn.close()

        return jsonify({
            "data": data,
            "sector_counts": sector_counts
        })
    else:
        return jsonify({"error": "Database connection failed"}), 500

@app.route('/')
def dashboard():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)