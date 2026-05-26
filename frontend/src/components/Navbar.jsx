import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sprout, LogOut, Menu, X, User, BarChart2, History, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    return `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-nature-500/10 text-nature-400 border border-nature-500/20'
        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-3 md:px-8">
      <div className="mx-auto max-w-7xl glass-card rounded-2xl px-4 py-3 md:px-6 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          {/* Logo / Brand Name */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-nature-500/20 rounded-xl group-hover:bg-nature-500/30 transition-colors">
              <Sprout className="h-6 w-6 text-nature-400" />
            </div>
            <span className="font-outfit text-lg font-bold tracking-tight text-white group-hover:text-nature-400 transition-colors">
              Crop Suggestion System
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link to="/predict" className={navLinkClass('/predict')}>
                  <Sprout className="h-4 w-4" />
                  Suggest Crop
                </Link>
                <Link to="/history" className={navLinkClass('/history')}>
                  <History className="h-4 w-4" />
                  History
                </Link>
                <Link to="/analytics" className={navLinkClass('/analytics')}>
                  <BarChart2 className="h-4 w-4" />
                  Analytics
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={navLinkClass('/admin')}>
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass('/')}>
                  Home
                </Link>
                <Link to="/predict" className={navLinkClass('/predict')}>
                  <Sprout className="h-4 w-4" />
                  Quick Suggestion
                </Link>
              </>
            )}
          </div>

          {/* Desktop User profile/Login controls */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700/60">
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <div className="h-6 w-6 rounded-full bg-nature-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user?.username[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-200">{user?.username}</span>
                  {isAdmin && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold uppercase">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-nature-600 hover:bg-nature-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-md shadow-nature-600/20 hover:shadow-nature-600/30 hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-700/60 flex flex-col gap-2 animate-fade-in">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass('/dashboard')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/predict"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass('/predict')}
                >
                  <Sprout className="h-4 w-4" />
                  Suggest Crop
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass('/history')}
                >
                  <History className="h-4 w-4" />
                  History
                </Link>
                <Link
                  to="/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass('/analytics')}
                >
                  <BarChart2 className="h-4 w-4" />
                  Analytics
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass('/admin')}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                
                {/* Mobile User Details & Logout */}
                <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-nature-600 flex items-center justify-center font-bold text-white uppercase text-sm">
                      {user?.username[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white leading-tight">{user?.username}</div>
                      <div className="text-[10px] text-slate-400">{user?.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500 hover:text-white transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass('/')}
                >
                  Home
                </Link>
                <Link
                  to="/predict"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass('/predict')}
                >
                  <Sprout className="h-4 w-4" />
                  Quick Suggestion
                </Link>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/60">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-nature-600 hover:bg-nature-500 text-white text-sm font-medium shadow-md shadow-nature-600/20"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
