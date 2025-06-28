import React from 'react';
import { PlayerLeaderboardEntry } from './Leaderboard';

interface TeamDetailModalProps {
  team: {
    id: number;
    name: string;
    formation: string;
    total_points: number;
    user_name: string;
    players: PlayerLeaderboardEntry[];
  } | null;
  onClose: () => void;
}

const PlayerCard: React.FC<{ player: PlayerLeaderboardEntry }> = ({ player }) => {
  const getPositionColor = (position: string) => {
    switch(position?.toLowerCase()) {
      case 'forward':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'midfielder':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'defender':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'goalkeeper':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className={`${getPositionColor(player.position)} p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
      <div className="flex justify-between items-center">
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {player.name}
            </h4>
            {player.is_captain && (
              <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded">
                C
              </span>
            )}
          </div>
          <div className="flex items-center mt-1 space-x-2">
            <span className="px-2 py-0.5 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 rounded">
              {player.position}
            </span>
            {player.house && (
              <span className="px-2 py-0.5 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 rounded">
                {player.house}
              </span>
            )}
          </div>
        </div>
        <div className="text-right ml-2">
          <p className="text-base font-bold text-gray-900 dark:text-white">{player.points}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">${player.price}</p>
        </div>
      </div>
    </div>
  );
};

const TeamDetailModal: React.FC<TeamDetailModalProps> = ({ team, onClose }) => {
  if (!team) {
    return null;
  }

  // Group players by position
  const playersByPosition = team.players.reduce((acc, player) => {
    const position = player.position || 'Other';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {} as Record<string, PlayerLeaderboardEntry[]>);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 my-4">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold truncate">{team.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                  {team.formation}
                </span>
                <span className="text-sm">{team.total_points} pts</span>
              </div>
              <p className="text-xs mt-1 opacity-90">
                Managed by <span className="font-medium">{team.user_name}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <span className="text-xl font-bold">×</span>
            </button>
          </div>
        </div>

        {/* Players Section */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {Object.entries(playersByPosition).map(([position, players]) => (
            <div key={position} className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {position} • {players.length} {players.length === 1 ? 'player' : 'players'}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </div>
          ))}

          {team.players.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No players in this team</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;