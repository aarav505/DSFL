import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
import PlayerSelectionModal from './PlayerSelectionModal';
import { getFullPositionName } from './PlayerSelectionModal';

export interface Player {
  id: number;
  name: string;
  position: string;
  price: number;
  house?: string;
  points?: number;
}

interface Team {
  id: number;
  name: string;
  user_id: number;
  formation: string | null;
  players: Player[];
  captain: Player | null;
  total_points: number;
  rank?: number;
}

// Define formations for display
const FORMATIONS: { [key: string]: { GK: number; DEF: number; MID: number; ATT: number } } = {
  '4-4-2': { GK: 1, DEF: 4, MID: 4, ATT: 2 },
  '4-3-3': { GK: 1, DEF: 4, MID: 3, ATT: 3 },
  '3-5-2': { GK: 1, DEF: 3, MID: 5, ATT: 2 },
  '3-4-3': { GK: 1, DEF: 3, MID: 4, ATT: 3 },
};

const MyTeamPlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // New state for formation UI
  const [selectedFormation, setSelectedFormation] = useState<string>('4-4-2');
  const [assignedPlayers, setAssignedPlayers] = useState<{ [slotId: string]: Player | null }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{ positionType: 'GK' | 'DEF' | 'MID' | 'ATT'; slotId: string } | null>(null);
  const [isCaptainSelectionMode, setIsCaptainSelectionMode] = useState(false); // New state for captain selection mode

  // Permanent adjustment values
  const GK_OFFSET_X = -22;
  const GK_OFFSET_Y = 101;
  const DEF_OFFSET_X = -24;
  const DEF_OFFSET_Y = 27;
  const DEF_SPACE_X = 22; 
  const MID_OFFSET_X = -24;
  const MID_OFFSET_Y = -40;
  const MID_SPACE_X = 22; 
  const ATT_OFFSET_X = -26;
  const ATT_OFFSET_Y = -86;
  const ATT_SPACE_X = 25; 

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PLAYERS, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setError(error.message || 'Failed to load players.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchMyTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(API_ENDPOINTS.MY_TEAM, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 404) {
        // No team found for the user, which is expected for new users
        setUserTeam(null);
        return;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Team data from API:', JSON.stringify(data, null, 2));
      setUserTeam(data);
      setSelectedPlayers(data.players || []);
      setCaptainId(data.captain ? data.captain.id : null);
      
      // Debug: Check if players have points
      if (data.players) {
        console.log('Players with points:', data.players.map((p: any) => ({
          id: p.id,
          name: p.name,
          points: p.points,
          hasPerformances: Array.isArray(p.performances) ? p.performances.length : 0
        })));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load your team.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPlayers();
    fetchMyTeam();
  }, [fetchPlayers, fetchMyTeam]);

  // Effect to populate selectedFormation and selectedPlayers when userTeam changes initially
  useEffect(() => {
    console.log("useEffect running, userTeam:", userTeam);
    if (userTeam) {
      const defaultFormation = '4-4-2';
      const teamFormation = userTeam.formation && FORMATIONS[userTeam.formation]
                            ? userTeam.formation
                            : defaultFormation;
                            
      console.log("Resolved teamFormation:", teamFormation);
      setSelectedFormation(teamFormation);
      setSelectedPlayers(userTeam.players || []); // Update selectedPlayers here
      setCaptainId(userTeam.captain ? userTeam.captain.id : null);
    } else {
      console.log("userTeam is null, resetting assigned players and formation.");
      setSelectedPlayers([]);
      setCaptainId(null);
      setSelectedFormation('4-4-2'); // Reset to default formation
    }
  }, [userTeam]);

  // Effect to re-assign players based on selectedFormation and selectedPlayers
  useEffect(() => {
    console.log("Re-assignment useEffect running. selectedFormation:", selectedFormation, "selectedPlayers:", selectedPlayers);
    const newAssignedPlayers: { [slotId: string]: Player | null } = {};
    const playerPositions: { [position: string]: Player[] } = { GK: [], DEF: [], MID: [], ATT: [] };

    // Group selected players by their natural position
    selectedPlayers.forEach(player => {
      if (player.position && playerPositions[player.position]) {
        playerPositions[player.position].push(player);
      } else {
        console.warn("Player position not found or invalid for player:", player);
      }
    });

    const currentFormationRules = FORMATIONS[selectedFormation];
    if (currentFormationRules) {
      Object.entries(currentFormationRules).forEach(([positionType, count]) => {
        const playersForPosition = playerPositions[positionType] || [];
        for (let i = 0; i < count; i++) {
          const slotId = `${positionType.toLowerCase()}-${i}`;
          if (playersForPosition[i]) {
            newAssignedPlayers[slotId] = playersForPosition[i];
          } else {
            newAssignedPlayers[slotId] = null; // Ensure all slots are accounted for
          }
        }
      });
    } else {
      console.error("currentFormationRules is undefined for formation:", selectedFormation);
    }

    setAssignedPlayers(newAssignedPlayers);
  }, [selectedFormation, selectedPlayers]);

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayers(prevSelected => {
      const isSelected = prevSelected.some(p => p.id === player.id);
      if (isSelected) {
        // Player is already selected, remove them
        // Also, if this player was the captain, deselect captain
        if (captainId === player.id) {
          setCaptainId(null);
        }
        // Also, if this player is assigned to a slot, unassign them
        setAssignedPlayers(prevAssigned => {
          const newAssigned = { ...prevAssigned };
          for (const key in newAssigned) {
            if (newAssigned[key] && newAssigned[key]!.id === player.id) {
              newAssigned[key] = null;
            }
          }
          return newAssigned;
        });
        return prevSelected.filter(p => p.id !== player.id);
      } else {
        // Player is not selected, add them
        return [...prevSelected, player];
      }
    });
  };

  const handleAssignPlayer = (slotId: string, player: Player | null) => {
    setAssignedPlayers(prevAssigned => {
      const newAssigned = { ...prevAssigned };
      
      // If a player is being assigned to this slot
      if (player) {
        // Check if the player is already assigned to another slot
        for (const key in newAssigned) {
          if (newAssigned[key] && newAssigned[key]!.id === player.id) {
            newAssigned[key] = null; // Unassign from the old slot
          }
        }
        newAssigned[slotId] = player; // Assign to the new slot
      } else {
        // If null is passed, it means unassign from this slot
        newAssigned[slotId] = null;
      }
      return newAssigned;
    });
  };

  const handleOpenModal = (positionType: 'GK' | 'DEF' | 'MID' | 'ATT', slotId: string) => {
    setCurrentSlot({ positionType, slotId });
    setIsCaptainSelectionMode(false); // Ensure regular selection mode
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSlot(null);
    setIsCaptainSelectionMode(false); // Reset mode on close
  };

  const handleSelectPlayerFromModal = (player: Player) => {
    if (isCaptainSelectionMode) {
      handleSetCaptain(player.id);
    } else if (currentSlot) {
      handleAssignPlayer(currentSlot.slotId, player);
    }
    handleCloseModal();
  };

  const handleOpenCaptainModal = () => {
    setIsCaptainSelectionMode(true);
    setIsModalOpen(true);
    setCurrentSlot(null); // No specific slot when selecting captain
  };

  const handleSetCaptain = (playerId: number | null) => {
    setCaptainId(playerId);
  };

  // Calculate total team price
  const totalTeamPrice = Object.values(assignedPlayers)
    .filter((player): player is Player => player !== null)
    .reduce((total, player) => total + player.price, 0);

  // Get current assigned players for the modal
  const currentAssignedPlayers = Object.values(assignedPlayers).filter((player): player is Player => player !== null);

  const BUDGET = 100; // Define a fixed budget for now, can be dynamic later

  const handleCreateTeam = async () => {
    // Validation checks
    const assignedPlayerIds = Object.values(assignedPlayers)
      .filter((player): player is Player => player !== null)
      .map(player => player.id);

    if (assignedPlayerIds.length < 11) {
      alert('Please assign players to all positions in the selected formation.');
      return;
    }

    if (new Set(assignedPlayerIds).size !== assignedPlayerIds.length) {
      alert('Duplicate players assigned to different positions.');
      return;
    }

    if (totalTeamPrice > BUDGET) {
      alert(`Team price exceeds budget! Current: ₹${totalTeamPrice}, Budget: ₹${BUDGET}`);
      return;
    }

    if (captainId === null || !assignedPlayerIds.includes(captainId)) {
      alert('Please select a captain from your assigned players.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const teamData = {
        formation: selectedFormation,
        players: assignedPlayerIds.map(id => ({
          player_id: id,
          is_captain: id === captainId
        }))
      };

      console.log('Sending team data:', teamData);

      const url = userTeam ? `${API_ENDPOINTS.MY_TEAM}/${userTeam.id}` : API_ENDPOINTS.MY_TEAM;
      const response = await fetch(url, {
        method: userTeam ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server error response:', errorData);
        throw new Error(errorData?.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Team update response:', data);

      // Fetch the updated team data immediately
      await fetchMyTeam();

      // Show success message
      alert(userTeam ? 'Team updated successfully!' : 'Team created successfully!');
    } catch (error: any) {
      console.error('Error saving team:', error);
      alert(error.message || 'Failed to save team. Please try again.');
    }
  };

  // Helper to render player slots based on formation rules
  const renderPlayerSlots = (positionType: 'GK' | 'DEF' | 'MID' | 'ATT') => {
    const count = FORMATIONS[selectedFormation][positionType];
    const slots = [];
    for (let i = 0; i < count; i++) {
      const slotId = `${positionType.toLowerCase()}-${i}`;
      const assignedPlayer = assignedPlayers[slotId] || null;
      const isCaptain = assignedPlayer?.id === captainId;
      slots.push(
        <PlayerSlot
          key={slotId}
          slotId={slotId}
          positionType={positionType}
          assignedPlayer={assignedPlayer}
          onAssign={handleAssignPlayer}
          onOpenModal={handleOpenModal}
          isCaptain={isCaptain}
          onSetCaptain={handleSetCaptain}
        />
      );
    }
    return slots;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error && players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Players</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPlayers}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Main container for the 3D field */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden mb-8">
        {/* The football field with player slots */}
        <div className="w-full relative overflow-hidden" style={{ aspectRatio: 'calc(3 / 2)' }}>
          <img
            src="/field.png"
            alt="Football Field"
            className="absolute inset-0 w-full h-full object-contain transform translate-y-24"
          />
          {/* Player Slots - dynamically generated based on formation */}
          <div className="absolute inset-0 flex flex-col justify-around p-4">
            {/* Goalkeeper */}
            <div className="flex justify-center items-center mb-2" style={{ transform: `translateY(${GK_OFFSET_Y}px) translateX(${GK_OFFSET_X}px)` }}>
              {renderPlayerSlots('GK')}
            </div>

            {/* Defenders */}
            <div className="flex justify-center items-center mb-2" style={{ gap: `${DEF_SPACE_X * 4}px`, transform: `translateY(${DEF_OFFSET_Y}px) translateX(${DEF_OFFSET_X}px)` }}>
              {renderPlayerSlots('DEF')}
            </div>

            {/* Midfielders */}
            <div className="flex justify-center items-center mb-2" style={{ gap: `${MID_SPACE_X * 4}px`, transform: `translateY(${MID_OFFSET_Y}px) translateX(${MID_OFFSET_X}px)` }}>
              {renderPlayerSlots('MID')}
            </div>

            {/* Attackers */}
            <div className="flex justify-center items-center mb-2" style={{ gap: `${ATT_SPACE_X * 4}px`, transform: `translateY(${ATT_OFFSET_Y}px) translateX(${ATT_OFFSET_X}px)` }}>
              {renderPlayerSlots('ATT')}
            </div>
          </div>
        </div>

        {/* Captain Selection Button (positioned on the field) */}
        <div className="absolute bottom-6 right-6 z-10">
          <button
            onClick={handleOpenCaptainModal}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
              captainId 
                ? 'bg-amber-500 hover:bg-amber-600 text-amber-900 dark:text-amber-50 dark:bg-amber-600 dark:hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {captainId ? 'Change Captain' : 'Select Captain'}
          </button>
        </div>

        {/* Formation Selection Dropdown (positioned on the field) */}
        <div className="absolute bottom-6 left-6 z-10">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-75 group-hover:opacity-100 transition duration-200 blur-sm"></div>
            <div className="relative">
              <select
                id="formation"
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer pr-10 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.keys(FORMATIONS).map(formationName => (
                  <option key={formationName} value={formationName} className="bg-white dark:bg-gray-800">
                    {formationName} Formation
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={handleCreateTeam}
          className="w-full bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition duration-200 font-semibold"
        >
          {userTeam ? 'Update Team' : 'Create Team'}
        </button>
      </div>

      {/* Team Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Budget Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</h3>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{BUDGET - totalTeamPrice}</span>
            <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">/ ₹{BUDGET}</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  totalTeamPrice > BUDGET 
                    ? 'bg-red-500 dark:bg-red-600' 
                    : 'bg-green-500 dark:bg-green-600'
                }`}
                style={{ width: `${Math.min(100, (totalTeamPrice / BUDGET) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Spent: ₹{totalTeamPrice}</span>
              <span className={`font-medium ${
                totalTeamPrice > BUDGET 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {totalTeamPrice > BUDGET ? 'Over Budget' : 'Within Budget'}
              </span>
            </div>
          </div>
        </div>

        {/* Team Points Card */}
        {userTeam && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Points</h3>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{userTeam.total_points}</span>
              <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Points</span>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="flex items-center text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-1"></span>
                Current Rank: <span className="font-medium ml-1 text-gray-900 dark:text-white">#{userTeam?.rank !== undefined && userTeam.rank !== null ? userTeam.rank : '--'}</span>
              </span>
            </div>
          </div>
        )}

        {/* Team Value Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Value</h3>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalTeamPrice}</span>
            <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center text-sm">
              <span className="flex items-center text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-1"></span>
                Players: <span className="font-medium ml-1 text-gray-900 dark:text-white">{Object.values(assignedPlayers).filter(Boolean).length}/11</span>
              </span>
            </div>
          </div>
        </div>
      </div>


          {/*
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (₹)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                House
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map(player => (
              <tr key={player.id} className={
                `hover:bg-gray-50 ${selectedPlayers.some(p => p.id === player.id) ? 'bg-blue-50' : ''}`
              }>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.some(p => p.id === player.id)}
                      onChange={() => handleSelectPlayer(player)}
                      className="form-checkbox h-4 w-4 text-orange-600 transition duration-150 ease-in-out"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.house || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{player.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
          */}
      {isModalOpen && (
        <PlayerSelectionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          players={isCaptainSelectionMode ? currentAssignedPlayers : players.filter(p => p.position === currentSlot?.positionType && !Object.values(assignedPlayers).some(ap => ap?.id === p.id))}
          onSelectPlayer={handleSelectPlayerFromModal}
          modalTitle={isCaptainSelectionMode ? 'Select Captain' : `Find ${getFullPositionName(currentSlot?.positionType || 'GK')}`}
          positionType={currentSlot?.positionType || 'GK'}
          currentAssignedPlayerId={captainId}
          isViewingMyTeam={isCaptainSelectionMode}
        />
      )}
    </motion.div>
  );
};

interface PlayerSlotProps {
  slotId: string;
  positionType: 'GK' | 'DEF' | 'MID' | 'ATT';
  assignedPlayer: Player | null;
  onAssign: (slotId: string, player: Player | null) => void;
  onOpenModal: (positionType: 'GK' | 'DEF' | 'MID' | 'ATT', slotId: string) => void;
  isCaptain: boolean;
  onSetCaptain: (playerId: number | null) => void;
}

const PlayerSlot: React.FC<PlayerSlotProps> = ({ slotId, positionType, assignedPlayer, onAssign, onOpenModal, isCaptain, onSetCaptain }) => {
  const handleRemovePlayer = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when removing
    onAssign(slotId, null);
    if (isCaptain) {
      onSetCaptain(null); // Deselect captain if the removed player was captain
    }
  };
  
  // Get position display name

  // Helper function to get house color classes with gradients and styling
  const getHouseColorClass = (type: 'bg' | 'text' | 'border' | 'ring' = 'bg') => {
    if (!assignedPlayer?.house) return '';
    
    const colorMap: Record<string, Record<string, string>> = {
      'Hyderabad': {
        bg: 'bg-gradient-to-br from-blue-900 to-blue-800',
        text: 'text-blue-100',
        border: 'border-blue-800',
        ring: 'ring-blue-900/20'
      },
      'Oberoi': {
        bg: 'bg-gradient-to-br from-blue-600 to-blue-500',
        text: 'text-blue-50',
        border: 'border-blue-500',
        ring: 'ring-blue-500/20'
      },
      'Kashmir': {
        bg: 'bg-gradient-to-br from-yellow-500 to-yellow-400',
        text: 'text-yellow-900 dark:text-yellow-100',
        border: 'border-yellow-400',
        ring: 'ring-yellow-400/20'
      },
      'Tata': {
        bg: 'bg-gradient-to-br from-red-600 to-red-500',
        text: 'text-red-50',
        border: 'border-red-500',
        ring: 'ring-red-500/20'
      },
      'Jaipur': {
        bg: 'bg-gradient-to-br from-green-700 to-green-600',
        text: 'text-green-50',
        border: 'border-green-600',
        ring: 'ring-green-600/20'
      },
    };
    
    return colorMap[assignedPlayer.house]?.[type] || '';
  };
  
  // Get position display name
  const positionName = positionType === 'GK' ? 'Goalkeeper' :
                      positionType === 'DEF' ? 'Defender' :
                      positionType === 'MID' ? 'Midfielder' : 'Forward';
  
  // Helper function to get first name only
  const formatPlayerName = (fullName: string) => {
    return fullName.split(' ')[0]; // Return only the first name
  };

  return (
    <div className="flex flex-col items-center w-24 relative group">
      {/* Player card with house color */}
      <div 
        className={`relative w-20 h-20 ${getHouseColorClass('bg')} ${getHouseColorClass('text')} 
                  flex items-center justify-center cursor-pointer transition-all duration-300 
                  rounded-xl shadow-md hover:shadow-lg ${getHouseColorClass('ring')} hover:ring-2 overflow-hidden
                  transform hover:-translate-y-0.5`}
        onClick={() => onOpenModal(positionType, slotId)}
        title={assignedPlayer ? `${assignedPlayer.name}${isCaptain ? ' (Captain)' : ''}` : `Assign ${positionName}`}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        {assignedPlayer ? (
          <>
            {/* Player content */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-1">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                <span className="font-bold text-lg text-white">
                  {formatPlayerName(assignedPlayer.name).charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-center text-sm text-white drop-shadow mt-1.5 truncate w-full px-1">
                {formatPlayerName(assignedPlayer.name)}
              </span>
            </div>
            
            {/* Captain badge */}
            {isCaptain && (
              <div className="absolute top-1 right-1 bg-yellow-400 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
            
            {/* Remove button */}
            <button 
              className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-md hover:scale-110"
              title="Remove player"
              onClick={(e) => {
                e.stopPropagation();
                handleRemovePlayer(e);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium text-center mt-1.5">
              Add
            </span>
          </div>
        )}
      </div>
      
      {/* Team name badge */}
      <div className="h-6 flex items-center justify-center">
        {assignedPlayer?.house ? (
          <div className="px-2.5 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className={`text-xs font-medium leading-none ${
              assignedPlayer.house === 'Hyderabad' ? 'text-blue-900 dark:text-blue-100' :
              assignedPlayer.house === 'Oberoi' ? 'text-blue-700 dark:text-blue-100' :
              assignedPlayer.house === 'Kashmir' ? 'text-yellow-800 dark:text-yellow-200' :
              assignedPlayer.house === 'Tata' ? 'text-red-700 dark:text-red-100' :
              'text-green-700 dark:text-green-100' // Jaipur
            }`}>
              {assignedPlayer.house}
            </span>
          </div>
        ) : (
          <div className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/50">
            <span className="text-xs font-medium leading-none text-gray-700 dark:text-gray-300">
              {positionType}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeamPlayers;