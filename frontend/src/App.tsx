import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Leaderboard from './components/Leaderboard';
import Points from './components/Points';
import News from './components/News';
import MyTeamPlayers from './components/MyTeamPlayers';
import AdminPage from './components/AdminPage';
import ThemeToggle from './components/ThemeToggle';
import Footer from './components/Footer';

const getIsAdmin = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.is_admin;
  } catch {
    return false;
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<{ token: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if Navbar should be hidden
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('App.tsx - Initial token check:', token ? 'exists' : 'missing');
    if (token) {
      setUser({ token });
      const isAdmin = getIsAdmin();
      if (isAdmin && location.pathname !== '/admin') {
        navigate('/admin', { replace: true });
      }
      if (!isAdmin && location.pathname === '/admin') {
        navigate('/my-team', { replace: true });
      }
    } else {
      setUser(null);
    }
  }, [location.pathname, navigate]);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    
    useEffect(() => {
      console.log('ProtectedRoute - useEffect running');
      const token = localStorage.getItem('token');
      console.log('ProtectedRoute - Current token:', token ? 'exists' : 'missing');
      if (!token) {
        console.log('ProtectedRoute - No token found, navigating to /login');
        navigate('/login');
      } else {
        console.log('ProtectedRoute - Token found, setting isAuthorized to true');
        setIsAuthorized(true);
      }
    }, []);

    console.log('ProtectedRoute - isAuthorized state:', isAuthorized);

    if (isAuthorized === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      );
    }
    
    if (!isAuthorized) {
      return null;
    }
    
    // Admins can only access /admin
    const isAdmin = getIsAdmin();
    if (isAdmin && location.pathname !== '/admin') {
      navigate('/admin', { replace: true });
      return null;
    }
    if (!isAdmin && location.pathname === '/admin') {
      navigate('/my-team', { replace: true });
      return null;
    }
    return <>{children}</>;
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        {!hideNavbar && <Navbar user={user} setUser={setUser} />}
        <main className={`flex-grow ${(location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') ? '' : 'container mx-auto px-4 py-8 pt-20'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-team" element={
              <ProtectedRoute>
                <MyTeamPlayers />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/points" element={
              <ProtectedRoute>
                <Points />
              </ProtectedRoute>
            } />
            <Route path="/news" element={
              <ProtectedRoute>
                <News />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              <Login setUser={setUser} />
            } />
            <Route path="/signup" element={
              <Signup setUser={setUser} />
            } />
          </Routes>
          <ThemeToggle />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;