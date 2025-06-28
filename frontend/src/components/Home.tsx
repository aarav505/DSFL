import React from 'react';
import { Link } from 'react-router-dom';
import TypingEffect from './TypingEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, StaggerContainer, FadeIn } from './PageTransition';


const Home: React.FC = () => {
  React.useEffect(() => {
    console.log('Home component mounted');
  }, []);

  return (
    <PageTransition>
      <div className="h-full flex items-center justify-center p-4 relative bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex w-full max-w-7xl relative" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Left section for text and buttons */}
          <div className="w-1/2 flex flex-col justify-center pr-8">
            <StaggerContainer>
              <FadeIn>
                <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-400 leading-tight mb-8 transform hover:scale-105 transition-transform duration-300">
                  Build. Battle. Brag.
                </h1>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8 max-w-md min-h-[120px]">
                  <TypingEffect 
                    text="Tired of yelling advice no one listens to? Now's your shot. Build your dream team, climb the leaderboard, and finally prove you actually know ball."
                    speed={20}
                  />
                </div>
              </FadeIn>
              
              <FadeIn delay={0.4}>
                <div className="flex space-x-6">
                  <Link 
                    to="/my-team"
                    className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-all duration-300 font-semibold text-lg inline-block transform hover:scale-105 hover:shadow-lg"
                    style={{ textDecoration: 'none' }}
                  >
                    MAKE MY TEAM
                  </Link>
                  <Link 
                    to="/news"
                    className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-8 py-3 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold text-lg inline-block transform hover:scale-105 hover:shadow-lg"
                    style={{ textDecoration: 'none' }}
                  >
                    NEWS
                  </Link>
                </div>
              </FadeIn>
            </StaggerContainer>
          </div>

          {/* Right section for illustration */}
          <div className="w-1/2 flex items-center justify-center relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.3
                }
              }}
              className="w-full h-full"
            >
              <img
                src="/ill.png"
                alt="Sports Illustration"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 object-cover transition-transform duration-700 hover:scale-105"
                style={{ width: '118.4625vw', height: '100vh' }} 
              />
            </motion.div>
          </div>
        </div>
        
        {/* Background animation elements */}
        <motion.div 
          className="absolute inset-0 -z-10 opacity-5 dark:opacity-[0.03]"
          initial={{ scale: 0.9, rotate: -5 }}
          animate={{ 
            scale: 1,
            rotate: 0,
            transition: {
              duration: 1.5,
              ease: 'easeOut',
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full filter blur-3xl"></div>
        </motion.div>
      </div>
      

    </PageTransition>
  );
};

export default Home;