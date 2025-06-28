import React from 'react';

interface PlayerDetailModalProps {
  playerStats: {
    id: number;
    name: string;
    position: string;
    house?: string;
    price: number;
    total_points: number;
    teams_count: number;
    captain_count: number;
  } | null;
  onClose: () => void;
}

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ playerStats, onClose }) => {
  if (!playerStats) {
    return null;
  }

  // Get house colors
  const getHouseColors = (house?: string) => {
    if (!house) return 'from-blue-600 to-blue-500';
    
    const houseLower = house.toLowerCase();
    if (houseLower.includes('hyderabad')) return 'from-blue-900 to-blue-800';
    if (houseLower.includes('oberoi')) return 'from-blue-400 to-blue-300';
    if (houseLower.includes('tata')) return 'from-red-600 to-red-500';
    if (houseLower.includes('kashmir')) return 'from-yellow-400 to-yellow-300';
    if (houseLower.includes('jaipur')) return 'from-green-700 to-green-600';
    
    return 'from-blue-600 to-blue-500';
  };

  // Get position icon based on player position
  const getPositionIcon = (position: string) => {
    switch(position.toLowerCase()) {
      case 'forward':
        return '⚽';
      case 'midfielder':
        return '🔄';
      case 'defender':
        return '🛡️';
      case 'goalkeeper':
        return '🧤';
      default:
        return '👤';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${getHouseColors(playerStats.house)} p-6 text-white`}>
          {/* Background pattern for better visual interest */}
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0dGVybiBpZD0icGF0dGVybi1iYXNlIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IGlkPSJwYXR0ZXJuLWJnIiB3aWR0aD0iNDAwJSIgaGVpZ2h0PSI0MDAlIiB4PSIwIiB5PSIwIiBmaWxsPSJ3aGl0ZSI+PC9yZWN0PjwvcGF0dGVybj48ZyBpZD0ic3ByaXRlcyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0idXJsKCNwYXR0ZXJuLWJhc2UpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjwvcGF0aD48L2c+PC9zdmc+')]" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <span className="text-xl font-bold">×</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-3xl">
              {getPositionIcon(playerStats.position)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{playerStats.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {playerStats.position}
                </span>
                {playerStats.house && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {playerStats.house}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <StatCard 
            title="Total Points" 
            value={playerStats.total_points} 
            icon={() => (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h3a2 2 0 012 2v6a2 2 0 01-2 2h-3m-6 0H7a2 2 0 01-2-2V9a2 2 0 012-2h3m0 0V5h4v2m-4 0h4m0 0v2m0 4v6m0 0h4m-4 0h-4" />
              </svg>
            )} 
          />
          <StatCard 
            title="Price" 
            value={`$${playerStats.price}`} 
            icon={() => (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )} 
          />
          <StatCard 
            title="In Teams" 
            value={playerStats.teams_count} 
            icon={() => (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )} 
          />
          <StatCard 
            title="Captain" 
            value={`${playerStats.captain_count} ${playerStats.captain_count === 1 ? 'time' : 'times'}`} 
            icon={() => (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            )} 
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailModal;