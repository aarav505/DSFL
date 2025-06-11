import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "dsfl-secret"  # change in production
    JWT_SECRET = "dsfl-jwt-secret"  # used for JWT token encryption
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'dsfl.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
