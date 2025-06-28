import React, { useState } from 'react';

const UserDetailModal = ({ user, team, onClose, onUserDeleted, currentUser }: { user: any, team: any, onClose: () => void, onUserDeleted: () => void, currentUser: any }) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Helper function to get position color
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK': return 'bg-yellow-100 text-yellow-800';
      case 'DEF': return 'bg-blue-100 text-blue-800';
      case 'MID': return 'bg-green-100 text-green-800';
      case 'ATT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get house color
  const getHouseColor = (house: string) => {
    switch (house) {
      case 'Hyderabad': return 'bg-orange-100 text-orange-800';
      case 'Jaipur': return 'bg-pink-100 text-pink-800';
      case 'Kashmir': return 'bg-blue-100 text-blue-800';
      case 'Oberoi': return 'bg-purple-100 text-purple-800';
      case 'Tata': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) return;
    setDeleting(true);
    setDeleteError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Debug: Log token and current user info
      console.log('Current User:', currentUser);
      console.log('Token:', token);
      
      if (token) {
        // Decode the token to see its contents
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Decoded Token Payload:', payload);
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
      
      const url = `/api/admin/users/${user.id}`;
      console.log('DELETE Request URL:', url);
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      console.log('Response Status:', res.status, res.statusText);
      
      // Handle empty response
      const contentType = res.headers.get('content-type');
      let errorData;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await res.json();
          console.log('Error Response Data:', errorData);
        } catch (e) {
          console.error('Error parsing JSON response:', e);
        }
      }
      
      if (!res.ok) {
        const errorMessage = errorData?.message || `Failed to delete user: ${res.status} ${res.statusText}`;
        console.error('Delete failed:', errorMessage);
        setDeleteError(errorMessage);
        setDeleting(false);
        return;
      }
      
      // If we get here, the delete was successful
      console.log('User deleted successfully');
      onUserDeleted();
      onClose();
    } catch (e: any) {
      console.error('Delete error:', e);
      setDeleteError(e.message || 'Failed to delete user. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>

        {/* User Information */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">{user.name}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email: <span className="text-gray-900">{user.email}</span></p>
              <p className="text-gray-600">Type: <span className="text-gray-900">{user.user_type}</span></p>
              {user.user_type === 'student' && (
                <>
                  <p className="text-gray-600">House: <span className="text-gray-900">{user.house}</span></p>
                  <p className="text-gray-600">Batch: <span className="text-gray-900">{user.batch} ({user.form})</span></p>
                  <p className="text-gray-600">School No: <span className="text-gray-900">{user.school_no}</span></p>
                </>
              )}
              {user.user_type === 'teacher' && (
                <p className="text-gray-600">Initials: <span className="text-gray-900">{user.initials}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Team Information */}
        {team ? (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Team Information</h3>
            
            {/* Team Overview */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Team Name</p>
                  <p className="font-semibold">{team.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Formation</p>
                  <p className="font-semibold">{team.formation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="font-semibold">{team.total_points}</p>
                </div>
              </div>
            </div>

            {/* Players List */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Players</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.players && team.players.map((player: any) => (
                  <div 
                    key={player.id}
                    className={`p-3 rounded-lg border ${
                      team.captain && team.captain.id === player.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {player.name}
                          {team.captain && team.captain.id === player.id && (
                            <span className="ml-2 text-orange-600">(C)</span>
                          )}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${getPositionColor(player.position)}`}>
                            {player.position}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getHouseColor(player.house)}`}>
                            {player.house}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formation Visualization */}
            {team.formation && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Formation</h4>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      {/* Formation visualization would go here */}
                      <p className="text-center text-gray-600">Formation: {team.formation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 text-center text-gray-500">
            No team information available
          </div>
        )}
        {deleteError && <div className="text-red-600 my-2">{deleteError}</div>}
        {currentUser?.is_admin && currentUser?.email === 'grandslam@doonschool.com' && currentUser?.id !== user.id && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Only the Grandslam admin can delete accounts</p>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailModal; 