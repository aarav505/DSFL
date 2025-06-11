from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

# Association table for Team and Player (many-to-many relationship)
team_players = db.Table('team_players',
    db.Column('team_id', db.Integer, db.ForeignKey('team.id'), primary_key=True),
    db.Column('player_id', db.Integer, db.ForeignKey('player.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    house = db.Column(db.String(50), nullable=False)  # Tata, Hyderabad, Kashmir, etc.

    # One-to-one relationship with Team (each user can have one team)
    team = db.relationship('Team', backref='user', uselist=False, lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    position = db.Column(db.String(10), nullable=False)  # e.g., GK, DEF, MID, ATT
    price = db.Column(db.Integer, nullable=False)
    house = db.Column(db.String(50), nullable=False)
    # Relationship to TeamPlayer for many-to-many with teams
    team_associations = db.relationship('TeamPlayer', back_populates='player', lazy=True)

class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # Name of the fantasy team
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    formation = db.Column(db.String(20), nullable=True) # e.g., '4-4-2', '3-5-2', now nullable

    # Many-to-many relationship with Player through TeamPlayer
    players = db.relationship('TeamPlayer', back_populates='team', lazy=True)

class TeamPlayer(db.Model):
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), primary_key=True)
    is_captain = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships to Team and Player
    team = db.relationship('Team', back_populates='players')
    player = db.relationship('Player', back_populates='team_associations')
    