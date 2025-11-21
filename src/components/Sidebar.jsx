import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, theme, setTheme, setUser, sidebarOpen, toggleSidebar } = useStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const getUserFirstName = () => {
    if (!user) return 'Guest';
    
    // If user has displayName, use first word
    if (user.displayName) {
      return user.displayName.split(' ')[0];
    }
    
    // Otherwise use email prefix
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  ];

  const themes = [
    { name: 'Minimal', value: 'minimal', icon: '✨' },
    { name: 'Dark', value: 'dark', icon: '🌙' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-[280px] border-r flex flex-col z-30 transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-[#ebe7dd] border-gray-300'
      } ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                CN
              </div>
              <div>
                <h1 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Cornell Notes
                </h1>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Smart note-taking
                </p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={toggleSidebar}
              className={`lg:hidden p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? theme === 'dark'
                    ? 'bg-blue-900/20 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Theme Selector */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-300'
        }`}>
          <p className={`text-xs font-semibold mb-2 px-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            THEME
          </p>
          <div className="space-y-1">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  theme === themeOption.value
                    ? theme === 'dark'
                      ? 'bg-gray-800 text-gray-100'
                      : 'bg-gray-200 text-gray-900'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:bg-gray-800/50'
                      : 'text-gray-600 hover:bg-gray-200/50'
                }`}
              >
                <span className="text-lg">{themeOption.icon}</span>
                <span className="text-sm font-medium">{themeOption.name}</span>
                {theme === themeOption.value && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-300'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
              {getUserFirstName().charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {getUserFirstName()}
              </p>
              <p className={`text-xs truncate ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {user?.email || 'guest@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900/20'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;