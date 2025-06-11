from app import app, db
from models import Player
import csv

with app.app_context():
    # Drop and recreate all tables
    db.drop_all()
    db.create_all()

    # Read players from CSV and add to database
    with open('players.csv', 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            player = Player(
                name=row['name'],
                position=row['position'],
                price=int(row['price']),
                house=row['house']
            )
            db.session.add(player)
    
    db.session.commit()
    print("Database populated successfully!")
