import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Points = () => {
  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Animation variants for the items
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 mb-4">
              Scoring System
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Detailed breakdown of how points are awarded for player performances.
            </p>
          </motion.div>

          {/* Overall Scoring Section */}
          <motion.div 
            className="mb-20"
            variants={itemVariants}
          >
            <motion.h2 
              className="text-3xl font-bold text-white mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Overall Scoring
              </span>
            </motion.h2>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700/50">
                    <tr>
                      {['Game Played', 'Yellow Card', 'Red Card', 'Performance Bonus'].map((header, index) => (
                        <th 
                          key={index}
                          className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    <tr className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-green-400">+2</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-yellow-400">-1</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-red-400">-3</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-blue-400">+1/+2/+3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>

          {/* Position Based Scoring Section */}
          <motion.div variants={itemVariants}>
            <motion.h2 
              className="text-3xl font-bold text-white mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Position Based Scoring
              </span>
            </motion.h2>
            
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700/50">
                    <tr>
                      {['Position', 'Clean Sheet', 'Assists', '2 Goals Conceded', 'Goal Scored'].map((header, index) => (
                        <th 
                          key={index}
                          className={`px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider ${index === 0 ? 'text-left' : 'text-center'}`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {[
                      { position: 'Goalkeeper', cleanSheet: '4', assists: '3', goalsConceded: '-1', goalScored: '7' },
                      { position: 'Defender', cleanSheet: '4', assists: '3', goalsConceded: '-1', goalScored: '6' },
                      { position: 'Midfielder', cleanSheet: '1', assists: '3', goalsConceded: '-', goalScored: '5' },
                      { position: 'Attacker', cleanSheet: '-', assists: '3', goalsConceded: '-', goalScored: '4' },
                    ].map((row, rowIndex) => (
                      <motion.tr 
                        key={rowIndex}
                        className="hover:bg-gray-700/30 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + (rowIndex * 0.1) }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-cyan-300">
                          {row.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-center text-green-400">
                          {row.cleanSheet}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-center text-blue-400">
                          {row.assists}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-center text-yellow-400">
                          {row.goalsConceded}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-center text-pink-400">
                          {row.goalScored}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer Note */}
          <motion.div 
            className="mt-16 text-center text-gray-400 text-sm"
            variants={itemVariants}
          >
            <p>Points are calculated automatically at the end of each match.</p>
            <p className="mt-2">For any discrepancies, please contact the admin.</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Points;
