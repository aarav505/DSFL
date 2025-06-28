import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../config';
import { useNavigate } from 'react-router-dom';
import TeamDetailModal from './TeamDetailModal';
import PlayerDetailModal from './PlayerDetailModal';

interface LeaderboardEntry {
  team_id: number;
  name: string;
  total_points: number;
}

export interface PlayerLeaderboardEntry {
  id: number;
  name: string;
  position: string;
  house?: string;
  points: number;
  is_captain?: boolean;
  price?: number;
}

interface TeamDetails {
  id: number;
  name: string;
  formation: string;
  total_points: number;
  user_name: string;
  players: PlayerLeaderboardEntry[];
}

interface PlayerStats {
  id: number;
  name: string;
  position: string;
  house?: string;
  price: number;
  total_points: number;
  teams_count: number;
  captain_count: number;
}

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<'teams' | 'players'>('teams');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playersLeaderboard, setPlayersLeaderboard] = useState<PlayerLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<TeamDetails | null>(null);
  const [selectedPlayerStats, setSelectedPlayerStats] = useState<PlayerStats | null>(null);
  const navigate = useNavigate();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const url = new URL(API_ENDPOINTS.LEADERBOARD);
      if (selectedHouse) {
        url.searchParams.append('house', selectedHouse);
      }
      if (selectedBatch) {
        url.searchParams.append('batch', selectedBatch);
      }
      if (selectedUserType) {
        url.searchParams.append('user_type', selectedUserType);
      }

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLeaderboard(data.map((entry: any) => ({
        team_id: entry.team_id,
        name: entry.user_name || entry.team_name, // Use user_name first, fallback to team_name
        total_points: entry.total_points,
      })));

    } catch (err: any) {
      setError(err.message || 'Failed to load team leaderboard.');
      console.error("Error fetching team leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate, selectedHouse, selectedBatch, selectedUserType]);

  const fetchPlayersLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const url = new URL(API_ENDPOINTS.PLAYER_LEADERBOARD);
      if (selectedHouse) {
        url.searchParams.append('house', selectedHouse);
      }
      if (selectedPosition) {
        url.searchParams.append('position', selectedPosition);
      }

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPlayersLeaderboard(data);

    } catch (err: any) {
      setError(err.message || 'Failed to load player leaderboard.');
      console.error("Error fetching player leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate, selectedHouse, selectedPosition]);

  const handleTeamClick = useCallback(async (teamId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_ENDPOINTS.TEAM_DETAILS}/${teamId}` , {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedTeam(data);
    } catch (error: any) {
      console.error("Failed to fetch team details:", error);
      setError(error.message || 'Failed to load team details.');
    }
  }, [navigate]);

  const handlePlayerClick = useCallback(async (playerId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_ENDPOINTS.PLAYER_STATS}/${playerId}/stats` , {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedPlayerStats(data);
    } catch (error: any) {
      console.error("Failed to fetch player stats:", error);
      setError(error.message || 'Failed to load player stats.');
    }
  }, [navigate]);

  const closeTeamDetailModal = () => {
    setSelectedTeam(null);
  };

  const closePlayerDetailModal = () => {
    setSelectedPlayerStats(null);
  };

  // Get house color classes
  const getHouseColorClasses = (house?: string) => {
    if (!house) return 'bg-gray-100 dark:bg-gray-700';
    
    const houseLower = house.toLowerCase();
    if (houseLower.includes('hyderabad')) return 'bg-blue-900 text-white';
    if (houseLower.includes('oberoi')) return 'bg-blue-400 text-gray-800';
    if (houseLower.includes('tata')) return 'bg-red-600 text-white';
    if (houseLower.includes('kashmir')) return 'bg-yellow-400 text-gray-800';
    if (houseLower.includes('jaipur')) return 'bg-green-700 text-white';
    
    return 'bg-gray-100 dark:bg-gray-700';
  };

  useEffect(() => {
    if (activeTab === 'teams') {
    fetchLeaderboard();
    } else {
      fetchPlayersLeaderboard();
    }
  }, [activeTab, fetchLeaderboard, fetchPlayersLeaderboard, selectedHouse, selectedBatch, selectedUserType, selectedPosition]);

  const filteredTeams = leaderboard.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlayers = playersLeaderboard.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex flex-col items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading leaderboard...</p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="text-center p-8 max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.div 
            className="text-red-500 text-5xl mb-6"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            ⚠️
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <motion.button
            onClick={() => {
              setError(null);
              if (activeTab === 'teams') {
                fetchLeaderboard();
              } else {
                fetchPlayersLeaderboard();
              }
            }}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const topTeam = filteredTeams.length > 0 ? filteredTeams[0] : null;

  // Animation variants for the main container and tabs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <div className="flex border-b border-gray-200 dark:border-gray-700 w-full justify-center">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'teams' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            onClick={() => {
              setActiveTab('teams');
              setSelectedHouse('');
              setSelectedBatch('');
              setSelectedUserType('');
            }}
          >
            Teams
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`ml-6 py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'players' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            onClick={() => {
              setActiveTab('players');
              setSelectedHouse('');
              setSelectedBatch('');
              setSelectedUserType('');
            }}
          >
            Players
          </motion.button>
        </div>
      </motion.div>

      {/* Filters Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap justify-center gap-2">
            {activeTab === 'teams' && (
              <>
                <div className="relative">
                  <select
                    value={selectedHouse}
                    onChange={(e) => setSelectedHouse(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="">🏠 All Houses</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Kashmir">Kashmir</option>
                    <option value="Oberoi">Oberoi</option>
                    <option value="Tata">Tata</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="">🗓️ All Batches</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                    <option value="2031">2031</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="">👤 All User Types</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'players' && (
              <>
                <div className="relative">
                  <select
                    value={selectedHouse}
                    onChange={(e) => setSelectedHouse(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="">🏠 All Houses</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Kashmir">Kashmir</option>
                    <option value="Oberoi">Oberoi</option>
                    <option value="Tata">Tata</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="">⚽ All Positions</option>
                    <option value="GK">Goalkeeper</option>
                    <option value="DEF">Defender</option>
                    <option value="MID">Midfielder</option>
                    <option value="ATT">Attacker</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'teams' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Team Leaderboard</h2>

          {topTeam && (
            <div className="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-5 mb-6 flex flex-col md:flex-row items-center justify-between shadow-lg cursor-pointer transform transition-transform duration-200 hover:scale-[1.02]"
                 onClick={() => handleTeamClick(topTeam.team_id)}>
              <div className="flex items-center">
                <span className="text-4xl font-extrabold text-orange-600 mr-4">🥇</span>
                <div>
                  <p className="text-2xl font-semibold text-orange-800 dark:text-orange-200">{topTeam.name}</p>
                  <p className="text-lg text-orange-700 dark:text-orange-300">Total Points: {topTeam.total_points}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal from opening again if already open
                  handleTeamClick(topTeam.team_id);
                }}
                className="mt-4 md:mt-0 bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors shadow-md"
              >
                View Details
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <motion.thead 
                className="bg-gray-50 dark:bg-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
              </motion.thead>
              <motion.tbody 
                className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredTeams.map((team, index) => (
                  <motion.tr 
                    key={team.team_id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                    onClick={() => handleTeamClick(team.team_id)}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{team.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.total_points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTeamClick(team.team_id);
                        }}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Player Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <motion.thead 
                className="bg-gray-50 dark:bg-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">House</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </motion.thead>
              <motion.tbody 
                className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredPlayers.map((player, index) => (
                  <motion.tr 
                    key={player.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                    onClick={() => handlePlayerClick(player.id)}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{player.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHouseColorClasses(player.house)}`}>
                        {player.house}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayerClick(player.id);
                        }}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View
                      </motion.button>
                </td>
                  </motion.tr>
                ))}
              </motion.tbody>
        </table>
      </div>
    </div>
      )}

      <TeamDetailModal team={selectedTeam} onClose={closeTeamDetailModal} />
      <PlayerDetailModal playerStats={selectedPlayerStats} onClose={closePlayerDetailModal} />
    </motion.div>
  );
};

export default Leaderboard;
