from flask import Flask, jsonify, request, send_from_directory
from config import Config
from models import db, bcrypt, Player
from auth_routes import auth
from team_routes import team
from admin_routes import admin
from utils import token_required
from flask_cors import CORS
from flask_migrate import Migrate
from sqlalchemy.exc import IntegrityError
import os
import csv

app = Flask(__name__, static_folder='../frontend/frontend/build')
app.config.from_object(Config)

# Configure CORS with specific origin and credentials
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Add request logging
@app.before_request
def log_request():
    print(f"\n=== Incoming Request ===")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {dict(request.headers)}")
    print(f"Data: {request.get_data()}")
    print("======================\n")

# Error handling
@app.errorhandler(IntegrityError)
def handle_integrity_error(error):
    return jsonify({"message": "Database error occurred", "error": str(error)}), 400

@app.errorhandler(Exception)
def handle_error(error):
    import traceback
    print("Global error handler caught exception:")
    print(f"Exception type: {type(error)}")
    print(f"Exception message: {str(error)}")
    print("Full traceback:")
    print(traceback.format_exc())
    return jsonify({"message": "An error occurred", "error": str(error)}), 500

# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(auth)
app.register_blueprint(team, url_prefix='/api/team')
app.register_blueprint(admin, url_prefix='/api/admin')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/api/players')
def get_players():
    try:
        # First, check if we have any players in the database
        existing_players = Player.query.all()
        print(f"Found {len(existing_players)} existing players in database")
        
        if not existing_players:
            print("No players in database, loading from CSV...")
            csv_path = os.path.join(BASE_DIR, 'Players.csv')
            print(f"Looking for CSV file at: {csv_path}")
            
            if not os.path.exists(csv_path):
                print(f"CSV file not found at {csv_path}")
                return jsonify({"error": "Players CSV file not found"}), 500
                
            # Load players from CSV into database
            with open(csv_path, 'r') as file:
                reader = csv.DictReader(file)
                player_count = 0
                for row in reader:
                    try:
                        player = Player(
                            name=row['name'],
                            position=row['position'],
                            price=int(row['price']),
                            house=row['house']
                        )
                        db.session.add(player)
                        player_count += 1
                    except Exception as e:
                        print(f"Error processing row: {row}")
                        print(f"Error: {str(e)}")
                        continue
                
                print(f"Added {player_count} players to database")
                db.session.commit()
                print("Players loaded into database successfully")

        # Return all players from database
        players = Player.query.all()
        print(f"Returning {len(players)} players from database")
        players_data = [{
            'id': player.id,
            'name': player.name,
            'position': player.position,
            'price': player.price,
            'house': player.house
        } for player in players]
        return jsonify(players_data), 200
    except Exception as e:
        import traceback
        print("Error loading players:")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Serve React App's index.html for the root route
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Removing duplicate route since we already have /api/players defined above

# Catch-all route: serves index.html for all other paths not handled by API routes
@app.route('/<path:path>')
def serve_react_app(path):
    # This part handles serving direct static files (like /static/js/main.chunk.js)
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # For any other path, return 404 since we want React Router to handle client-side routing
    return jsonify({"error": "Not Found"}), 404

# TEST Protected route
@app.route("/api/protected")
@token_required
def protected():
    return jsonify({"message": "You're authenticated!", "user": getattr(request, 'user', None)})

# Temporary route to recreate database tables
@app.route('/api/recreate_db')
def recreate_db():
    try:
        db.drop_all()
        db.create_all()
        return jsonify({"message": "Database tables recreated successfully"}), 200
    except Exception as e:
        import traceback
        print("Error recreating database:")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Initializing database...")
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully")
        
        # Check if we have any players
        players = Player.query.all()
        print(f"Found {len(players)} players in database")
        
    print("Starting Flask server...")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
