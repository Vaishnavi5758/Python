from flask import Flask, render_template, jsonify
from config.db_config import get_db_connection

app = Flask(__name__, template_folder="templates")

@app.route('/fetch_data', methods=['GET'])
def fetch_data():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)

        # Fetch all data
        cursor.execute("SELECT * FROM data_table")  
        data = cursor.fetchall()

        # Sector-wise counts
        sector_counts = {}
        swot = {"Strengths": 0, "Weaknesses": 0, "Opportunities": 0, "Threats": 0}

        for row in data:
            sector = row.get("sector") or "Unknown"  # Handle None values
            sector_counts[sector] = sector_counts.get(sector, 0) + 1

            # Apply SWOT logic based on data attributes
            relevance = row.get("relevance") or 0
            impact = row.get("impact") or 0
            likelihood = row.get("likelihood") or 0
            intensity = row.get("intensity") or 0

            if relevance >= 4 and impact > 0:
                swot["Strengths"] += 1
            if relevance <= 2 and impact < 0:
                swot["Weaknesses"] += 1
            if likelihood >= 3:
                swot["Opportunities"] += 1
            if intensity >= 4:
                swot["Threats"] += 1

        cursor.close()
        conn.close()

        return jsonify({
            "data": data,
            "sector_counts": sector_counts,
            "swot": swot
        })
    else:
        return jsonify({"error": "Database connection failed"}), 500

@app.route('/')
def dashboard():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)