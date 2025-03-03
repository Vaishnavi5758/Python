from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

# Define the Data Model
class Data(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    end_year = db.Column(db.String(10), nullable=True)  
    intensity = db.Column(db.Integer, nullable=True)
    sector = db.Column(db.String(100), nullable=True)
    topic = db.Column(db.String(100), nullable=True)
    insight = db.Column(db.Text, nullable=True)
    url = db.Column(db.String(500), nullable=True)
    region = db.Column(db.String(100), nullable=True)
    start_year = db.Column(db.String(10), nullable=True)
    impact = db.Column(db.String(100), nullable=True)
    added = db.Column(db.String(50), nullable=True)
    published = db.Column(db.String(50), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    relevance = db.Column(db.Integer, nullable=True)
    pestle = db.Column(db.String(100), nullable=True)
    source = db.Column(db.String(100), nullable=True)
    title = db.Column(db.String(500), nullable=True)
    likelihood = db.Column(db.Integer, nullable=True)

    # Method to Fetch All Data from DB
    @staticmethod
    def fetch_all():
        return Data.query.all()

    # Method to Fetch Data by ID
    @staticmethod
    def fetch_by_id(data_id):
        return Data.query.get(data_id)