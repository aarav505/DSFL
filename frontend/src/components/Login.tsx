import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';

interface LoginProps {
  setUser: (user: { token: string } | null) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setUser({ token });
      // Decode JWT to check is_admin
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.is_admin) {
        navigate('/admin');
      } else {
      navigate('/my-team');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-8 py-10 rounded-2xl shadow-auth dark:shadow-auth-dark bg-white dark:bg-gray-800 border dark:border-gray-700 border-accent-primary dark:border-accent-primaryDark">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Login</h2>
        {error && (
          <div className="bg-accent-error/10 dark:bg-accent-errorDark/20 border border-accent-error text-accent-error dark:text-accent-errorDark px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary dark:focus:ring-accent-primaryDark text-gray-800 dark:text-gray-300 pr-12 transition duration-200 hover:border-accent-primary dark:hover:border-accent-primaryDark dark:bg-transparent"
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-300">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary dark:focus:ring-accent-primaryDark text-gray-800 dark:text-gray-300 pr-12 transition duration-200 hover:border-accent-primary dark:hover:border-accent-primaryDark dark:bg-transparent"
                required
              />
              <span 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-300 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .983-2.614 2.51-4.904 4.482-6.912m0 0l-1.074-1.074m1.074 1.074l-1.611-1.611m7.458 9.202a3 3 0 11-6 0 3 3 0 016 0zm-3-3l-.001-.001M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-bold transition duration-200 transform hover:scale-105"
          >
            Login
          </button>
        </form>
        <div className="flex justify-center mt-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-orange-600 hover:underline font-semibold">
            Sign Up here
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

 