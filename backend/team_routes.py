from flask import Blueprint, request, jsonify
from models import db, Team, Player, TeamPlayer, User
from utils import token_required

team = Blueprint('team', __name__)

@team.route('/create', methods=['POST'])
@token_required
def create_team():
    user_id = getattr(request, 'user_id', None)
    if not user_id:
        return jsonify({'message': 'Unauthorized: User not found'}), 401

    data = request.get_json()
    team_name = data.get('name')
    player_ids = data.get('players', [])
    captain_id = data.get('captain_id')
    formation = data.get('formation', None)

    if not team_name or not player_ids or not captain_id:
        return jsonify({'message': 'Missing team name, players, or captain_id'}), 400

    # Check if user already has a team
    existing_team = Team.query.filter_by(user_id=user_id).first()
    if existing_team:
        return jsonify({'message': 'You already have a team. Please update your existing team.'}), 409

    try:
        # Check if all player_ids and captain_id are valid
        players = Player.query.filter(Player.id.in_(player_ids)).all()
        if len(players) != len(player_ids):
            return jsonify({'message': 'One or more player IDs are invalid.'}), 400

        captain = Player.query.get(captain_id)
        if not captain:
            return jsonify({'message': 'Captain ID is invalid.'}), 400
        if captain_id not in player_ids:
             return jsonify({'message': 'Captain must be one of the selected players.'}), 400

        new_team = Team(name=team_name, user_id=user_id, formation=formation)
        db.session.add(new_team)
        db.session.flush() # To get the new_team.id

        for player_id in player_ids:
            is_captain = (player_id == captain_id)
            team_player = TeamPlayer(team_id=new_team.id, player_id=player_id, is_captain=is_captain)
            db.session.add(team_player)

        db.session.commit()
        return jsonify({'message': 'Team created successfully!', 'team_id': new_team.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating team', 'error': str(e)}), 500

@team.route('/my_team', methods=['GET'])
@token_required
def get_my_team():
    user_id = getattr(request, 'user_id', None)
    if not user_id:
        return jsonify({'message': 'Unauthorized: User not found'}), 401

    team = Team.query.filter_by(user_id=user_id).first()

    if not team:
        return jsonify({'message': 'No team found for this user.'}), 404

    players_data = []
    for team_player in team.players:
        player = team_player.player
        if player:
            players_data.append({
                'id': player.id,
                'name': player.name,
                'position': player.position,
                'price': player.price,
                'house': player.house,
                'is_captain': team_player.is_captain
            })

    captain_info = next((p for p in players_data if p['is_captain']), None)

    team_info = {
        'id': team.id,
        'name': team.name,
        'user_id': team.user_id,
        'formation': team.formation,
        'players': players_data,
        'captain': captain_info
    }

    return jsonify(team_info), 200

@team.route('/players', methods=['GET'])
def get_players():
    try:
        players = Player.query.all()
        players_data = [{
            'id': player.id,
            'name': player.name,
            'position': player.position,
            'price': player.price,
            'house': player.house
        } for player in players]
        return jsonify(players_data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching players', 'error': str(e)}), 500 