import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: { token: string } | null;
  setUser: (user: { token: string } | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const navbarGlassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navbarGlassRef.current) {
      const activeLink = Object.values(navRefs.current).find(
        (ref) => ref && ref.getAttribute('href') === currentPath
      );

      if (activeLink) {
        const navbarRect = navbarGlassRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        setHighlightStyle({
          left: linkRect.left - navbarRect.left,
          width: linkRect.width,
        });
      }
    }
  }, [currentPath]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setUser(null);
    navigate('/');
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      ref={(el) => (navRefs.current[to] = el)}
      className={`relative px-4 py-2 text-gray-800 font-medium text-sm transition-colors duration-200 focus:outline-none`}
      style={{ textDecoration: 'none', cursor: 'pointer', zIndex: 1 }}
    >
      {children}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-10 flex justify-center py-4">
      <div className="container mx-auto flex items-center px-4">
        <div className="flex items-center mr-auto">
          <Link
            to="/"
            className="text-orange-600 text-5xl font-bold"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            DSFL
          </Link>
        </div>

        <div className="flex justify-center items-center navbar-glass" ref={navbarGlassRef}>
          <div className="nav-highlight" style={{ left: highlightStyle.left, width: highlightStyle.width }}></div>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/my-team">My Team</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/points">Points</NavLink>
          <NavLink to="/news">News</NavLink>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition duration-200"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition duration-200"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="border border-orange-600 text-orange-600 px-4 py-2 rounded-full hover:bg-orange-100 transition duration-200"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 