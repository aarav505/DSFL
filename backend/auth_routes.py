from flask import Blueprint, request, jsonify
from models import db, User
from utils import generate_token

auth = Blueprint('auth', __name__)

@auth.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ["name", "email", "password", "house"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"{field} is required"}), 400
    
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    house = data.get("house")

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409

    try:
        new_user = User(name=name, email=email, house=house)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Signup successful"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating user", "error": str(e)}), 500

@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        token = generate_token(user)
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {"id": user.id, "name": user.name, "house": user.house}
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401
