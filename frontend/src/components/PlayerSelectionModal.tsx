import React, { useState, useEffect } from 'react';
import { Player } from '../components/MyTeamPlayers'; // Assuming Player interface is exported

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  positionType: 'GK' | 'DEF' | 'MID' | 'ATT';
  currentAssignedPlayerId: number | null; // To exclude currently assigned player from selection
  modalTitle?: string; // New prop for dynamic modal title
  isViewingMyTeam?: boolean; // New prop to indicate viewing My Team
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  players,
  onSelectPlayer,
  positionType,
  currentAssignedPlayerId,
  modalTitle,
  isViewingMyTeam, // Destructure new prop
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    let currentPlayers = players; // Start with all players passed to the modal

    if (!isViewingMyTeam) {
      // Only filter by position and exclude current assigned player if not in viewing mode
      currentPlayers = currentPlayers.filter(p => p.position === positionType);
      currentPlayers = currentPlayers.filter(p => p.id !== currentAssignedPlayerId);
    }

    if (selectedHouse) {
      currentPlayers = currentPlayers.filter(p => p.house === selectedHouse);
    }

    if (searchTerm) {
      currentPlayers = currentPlayers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort players by price by default (highest to lowest)
    currentPlayers.sort((a, b) => b.price - a.price);

    setFilteredPlayers(currentPlayers);
  }, [isOpen, players, positionType, searchTerm, selectedHouse, currentAssignedPlayerId, isViewingMyTeam]);

  if (!isOpen) return null;

  const houses = ['Hyderabad', 'Jaipur', 'Kashmir', 'Oberoi', 'Tata'];

  return (
    <div className="fixed inset-0 bg-gray-200 dark:bg-gray-800 dark:bg-opacity-75 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg h-5/6 flex flex-col border border-gray-300 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-gray-800 dark:text-white text-xl font-bold">{modalTitle || `Add ${getFullPositionName(positionType)} (${positionType})`}</h2>
          </div>
          <button onClick={onClose} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-4xl font-semibold leading-none">
            &times;
          </button>
        </div>

        {!isViewingMyTeam && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search players by name"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        )}

        {!isViewingMyTeam && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedHouse(null)}
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedHouse === null 
                    ? 'bg-gray-800 dark:bg-gray-700 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              {houses.map(house => (
                <button
                  key={house}
                  onClick={() => setSelectedHouse(house)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedHouse === house 
                      ? `${getHouseBackgroundColorClass(house)} text-white` 
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {house}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200"
              >
                <div>
                  <p className="text-gray-800 dark:text-white font-semibold">{player.name}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {player.position} • <span className={getHouseColorClass(player.house || '')}>{player.house}</span>
                  </p>
                </div>
                <p className="text-gray-800 dark:text-white font-bold">₹{player.price.toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">No players found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const getHouseColorClass = (house: string) => {
  switch (house) {
    case 'Hyderabad': return 'text-blue-800 dark:text-blue-300';
    case 'Kashmir': return 'text-yellow-600 dark:text-yellow-400';
    case 'Oberoi': return 'text-blue-500 dark:text-blue-300';
    case 'Jaipur': return 'text-green-700 dark:text-green-400';
    case 'Tata': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-600 dark:text-gray-300';
  }
};

const getHouseBackgroundColorClass = (house: string) => {
  switch (house) {
    case 'Hyderabad': return 'bg-blue-800'; // Dark Blue
    case 'Kashmir': return 'bg-yellow-400'; // Yellow
    case 'Oberoi': return 'bg-blue-400'; // Light Blue
    case 'Jaipur': return 'bg-green-700'; // Slightly darker green
    case 'Tata': return 'bg-red-600'; // Red
    default: return 'bg-gray-600';
  }
};

export const getFullPositionName = (positionType: 'GK' | 'DEF' | 'MID' | 'ATT') => {
  switch (positionType) {
    case 'GK': return 'Goalkeeper';
    case 'DEF': return 'Defenders';
    case 'MID': return 'Midfielders';
    case 'ATT': return 'Attackers';
    default: return positionType; // Fallback
  }
};

export default PlayerSelectionModal; 