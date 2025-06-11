import jwt
from flask import request, jsonify
from functools import wraps
from config import Config

def generate_token(user):
    payload = {
        "user_id": user.id,
        "name": user.name,
        "house": user.house
    }
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")
    return token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated
