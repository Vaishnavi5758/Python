import pandas as pd
from config.db_config import get_db_connection

# Load JSON file
df = pd.read_json("C:/Users/User/Documents/Python/data/jsondata.json")

# Convert empty strings to None for integer fields
df.replace("", None, inplace=True)

# Handle NaN values (convert NaN to None)
#df = df.astype(object).where(pd.notnull(df), None)

# Replace empty strings and NaN values with None
df = df.where(pd.notnull(df), None)

# Convert start_year and end_year to None if empty or NaN, else convert to int
df["start_year"] = df["start_year"].apply(lambda x: None if pd.isna(x) or x == '' else int(x))
df["end_year"] = df["end_year"].apply(lambda x: None if pd.isna(x) or x == '' else int(x))

# Database connection
conn = get_db_connection()
if conn:
    cursor = conn.cursor()

# Check DataFrame columns to match MySQL table structure
print(">>>>>>>Columns in DataFrame:", df.columns)

# Adjust insert query to match your actual MySQL table columns
insert_query = """INSERT INTO data_table (end_year, intensity, sector, topic, insight, url, region, start_year, impact, added, published, country,
                                        relevance, pestle, source, title, likelihood)
                  VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

# Insert data row by row
for _, row in df.iterrows():
    values = tuple(None if pd.isna(row[col]) else row[col] for col in df.columns)
    print("Inserting values:", values)  # Debugging print
    cursor.execute(insert_query, values)

# Commit and close connection
conn.commit()
conn.close()

print("Data inserted successfully!")