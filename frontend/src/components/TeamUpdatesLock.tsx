import React, { useState, useCallback, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';

interface TeamUpdatesLockProps {
  onError: (message: string) => void;
}

const TeamUpdatesLock: React.FC<TeamUpdatesLockProps> = ({ onError }) => {
  const [updatesLocked, setUpdatesLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check team updates status
  const checkTeamUpdatesStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onError('Authentication required');
        return;
      }
      
      const response = await fetch(API_ENDPOINTS.ADMIN_TEAM_UPDATES_STATUS, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUpdatesLocked(data.updates_locked === true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch team updates status');
      }
    } catch (err) {
      console.error('Error checking team updates status:', err);
      onError('Failed to check team updates status');
      // Set default to false if there's an error
      setUpdatesLocked(false);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Toggle team updates lock
  const toggleTeamUpdates = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        onError('Authentication required');
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN_TOGGLE_TEAM_UPDATES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUpdatesLocked(data.updates_locked === true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle team updates');
      }
    } catch (err: any) {
      console.error('Error toggling team updates:', err);
      onError(err.message || 'Failed to toggle team updates');
    } finally {
      setIsLoading(false);
    }
  };

  // Check status on component mount
  useEffect(() => {
    checkTeamUpdatesStatus();
  }, [checkTeamUpdatesStatus]);

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700">
        Team Updates: 
        <span className={`ml-1 font-semibold ${updatesLocked ? 'text-red-600' : 'text-green-600'}`}>
          {updatesLocked ? 'LOCKED' : 'UNLOCKED'}
        </span>
      </span>
      <button
        onClick={toggleTeamUpdates}
        disabled={isLoading}
        className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
          updatesLocked 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-red-600 hover:bg-red-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Processing...' : updatesLocked ? 'Unlock Team Updates' : 'Lock Team Updates'}
      </button>
    </div>
  );
};

export default TeamUpdatesLock;
