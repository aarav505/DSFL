export const API_BASE_URL = 'https://dsfl-backend.onrender.com/';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  SIGNUP: `${API_BASE_URL}/signup`,
  PLAYERS: `${API_BASE_URL}/api/team/players`,
  MY_TEAM: `${API_BASE_URL}/api/team/my_team`,
  ADMIN_PLAYERS: `${API_BASE_URL}/api/admin/players`,
  ADD_MATCH_PERFORMANCE: `${API_BASE_URL}/api/admin/add_match_performance`,
  ADMIN_GAMES: `${API_BASE_URL}/api/admin/games`,
  ADMIN_DELETE_GAME: `${API_BASE_URL}/api/admin/games`,
  ADMIN_RESET_PLAYER_POINTS: `${API_BASE_URL}/api/admin/reset_player_points`,
  ADMIN_TEAM_UPDATES_STATUS: `${API_BASE_URL}/api/admin/team_updates_status`,
  ADMIN_TOGGLE_TEAM_UPDATES: `${API_BASE_URL}/api/admin/toggle_team_updates`,
  LEADERBOARD: `${API_BASE_URL}/api/team/leaderboard`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USER_TEAM: `${API_BASE_URL}/api/admin/user_team`,
  PLAYER_LEADERBOARD: `${API_BASE_URL}/api/team/players/leaderboard`,
  TEAM_DETAILS: `${API_BASE_URL}/api/team/teams`,
  PLAYER_STATS: `${API_BASE_URL}/api/team/players`
} as const; 