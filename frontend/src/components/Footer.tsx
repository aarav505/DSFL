import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  
  // Don't show footer on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <footer className="py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="container mx-auto">
        <p>Built by <span className="font-medium text-blue-600 dark:text-blue-400">Aarav Anand</span></p>
      </div>
    </footer>
  );
};

export default Footer;
