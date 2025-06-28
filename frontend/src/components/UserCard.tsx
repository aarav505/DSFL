import React from 'react';

const UserCard = ({ user, onClick }: { user: any, onClick: () => void }) => (
  <div className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors" onClick={onClick}>
    <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
    <p className="text-sm text-gray-600">{user.email}</p>
    <p className="text-sm text-gray-600">Type: {user.user_type}</p>
    {user.user_type === 'student' && (
      <>
        <p className="text-sm text-gray-600">House: {user.house}</p>
        <p className="text-sm text-gray-600">Batch: {user.batch} ({user.form})</p>
        <p className="text-sm text-gray-600">School No: {user.school_no}</p>
      </>
    )}
    {user.user_type === 'teacher' && (
      <p className="text-sm text-gray-600">Initials: {user.initials}</p>
    )}
  </div>
);

export default UserCard; 