import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Sun, Moon, User, LogOut, ChevronDown, Menu, X, Shield, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-b border-[#E8ECF4] dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated && onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-[#7C879B] hover:text-[#17243D] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#3867F5] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-[#2B52D9] transition-all">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-[#17243D] dark:text-white">
                  AI Analyzer
                </span>
                <span className="text-[10px] font-medium text-[#7C879B] dark:text-slate-400 -mt-0.5 tracking-wider uppercase">
                  Intelligent Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Right Navigation & User Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#7C879B] dark:text-slate-300 hover:text-[#17243D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              /* User Profile Pill & Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#3867F5] dark:hover:border-blue-500 transition-all shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#3867F5] dark:text-blue-400 font-semibold text-xs flex items-center justify-center">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-[#17243D] dark:text-white max-w-[120px] truncate hidden sm:inline">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#7C879B]" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8ECF4] dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#E8ECF4] dark:border-slate-800">
                      <p className="text-xs text-[#7C879B] dark:text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-[#17243D] dark:text-white truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#17243D] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#7C879B]" />
                      Profile Settings
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#17243D] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <History className="w-4 h-4 text-[#7C879B]" />
                      Analysis History
                    </Link>

                    <div className="border-t border-[#E8ECF4] dark:border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Public Header CTAs */
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#17243D] dark:text-white hover:text-[#3867F5] dark:hover:text-blue-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-[#3867F5] text-white hover:bg-[#2B52D9] transition-all shadow-md shadow-blue-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

