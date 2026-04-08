import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Target, User, ChevronDown, Settings, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(13, 13, 13, 0.95)',
      borderBottom: '1px solid rgba(139, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      zIndex: 10000,
    }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Target className="w-8 h-8" style={{ color: '#ff4444' }} />
            <span className="text-xl font-bold font-[Orbitron] tracking-wide" style={{ color: '#ff4444' }}>BugBounty MindMap</span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Teams Button */}
            <Link
              to="/teams"
              className="flex items-center space-x-2 px-4 py-2 transition-all"
              style={{
                backgroundColor: 'rgba(0, 255, 65, 0.15)',
                border: '1px solid rgba(0, 255, 65, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.15)';
              }}
            >
              <Users className="w-5 h-5" style={{ color: '#00ff41' }} />
              <span className="text-sm font-medium font-[Rajdhani]" style={{ color: '#00ff41' }}>MY_TEAMS</span>
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-4 py-2 transition-all"
                style={{
                  backgroundColor: 'rgba(74, 14, 78, 0.2)',
                  border: '1px solid rgba(74, 14, 78, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(74, 14, 78, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(74, 14, 78, 0.2)';
                }}
              >
                <User className="w-5 h-5" style={{ color: '#aa66aa' }} />
                <span className="text-sm font-medium font-[Rajdhani]" style={{ color: '#aa66aa' }}>{user?.username}</span>
                <ChevronDown className="w-4 h-4" style={{ color: '#aa66aa' }} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0" 
                    style={{ zIndex: 9998 }}
                    onClick={() => setShowDropdown(false)}
                  />
                  
                  <div
                    className="fixed right-4 top-20 w-56 rounded"
                    style={{
                      background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.98) 0%, rgba(45, 45, 45, 0.98) 100%)',
                      border: '1px solid rgba(204, 0, 0, 0.3)',
                      boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(204, 0, 0, 0.2)',
                      zIndex: 9999,
                    }}
                  >
                    {/* Profile Link */}
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center space-x-3 px-4 py-3 transition-all font-[Rajdhani] font-semibold"
                      style={{ color: '#aa66aa' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(74, 14, 78, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Settings className="w-5 h-5" />
                      <span>PROFILE_SETTINGS</span>
                    </Link>

                    <div style={{ height: '1px', backgroundColor: 'rgba(204, 0, 0, 0.2)', margin: '0 12px' }} />

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 transition-all font-[Rajdhani] font-semibold"
                      style={{ color: '#ff4444' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(204, 0, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>LOGOUT</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

