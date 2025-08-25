import React, { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut, Settings, Bell } from 'lucide-react';
import { NotificationCenter } from './notifications/NotificationCenter';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center flex-1">
          <div className="flex w-full max-w-lg items-center">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search across all your workspaces..."
              className="ml-2 w-full bg-transparent outline-none text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationCenter />
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center space-x-2 rounded-full bg-gray-100 dark:bg-gray-700 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                {user && (
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                )}
                <a 
                  href="/settings" 
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </a>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}