import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Ticket, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { UserRole } from '../../types/auth';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navigation = [
    { name: 'Events', href: '/events', icon: '🎪' },
    { name: 'Browse Tickets', href: '/listings', icon: '🎫' },
    { name: 'Browse Offers', href: '/offers', icon: '💰' },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Profile', href: '/profile', icon: Settings },
  ];

  if (user?.role === UserRole.BUYER) {
    userNavigation.push({ name: 'My Offers', href: '/my-offers', icon: Ticket });
  }

  if (user?.role === UserRole.SELLER) {
    userNavigation.push({ name: 'My Listings', href: '/my-listings', icon: Ticket });
  }

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass border-b border-white/20 shadow-xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Ticket className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                AutoMatch
              </span>
              <div className="text-xs text-gray-500 -mt-1 hidden lg:block">Tickets</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActivePath(item.href)
                    ? 'bg-blue-100/80 text-blue-700 shadow-md'
                    : 'text-gray-700 hover:bg-white/50 hover:text-blue-600'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side - Auth & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => navigate('/events')}
            >
              <Search className="h-4 w-4" />
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/50 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                        <span className="text-white font-semibold text-sm lg:text-base">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user?.role.toLowerCase()}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 glass rounded-2xl shadow-2xl border border-white/20 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-white/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user?.firstName} {user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                            <div className="text-xs text-blue-600 capitalize font-medium">
                              {user?.role.toLowerCase()} account
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {userNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white/50 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Icon className="h-4 w-4 mr-3 text-gray-500" />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="border-t border-white/20 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="shadow-lg hover:shadow-xl">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden glass rounded-2xl mt-2 mb-4 shadow-2xl border border-white/20 animate-scale-in">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActivePath(item.href)
                      ? 'bg-blue-100/80 text-blue-700'
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="border-t border-white/20 pt-4 mt-4 space-y-3">
                  <Link
                    to="/login"
                    className="block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="primary" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};