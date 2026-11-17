import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { School, LogOut, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcherBar = ({ onMobileMenuClick }) => {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || (role === 'teacher' ? 'Mrs. Ananya Sharma' : (role === 'admin' ? 'Dr. K. S. Raman' : 'Aarav Patel'));
  const roleLabel = role === 'admin' ? 'Principal' : (role === 'teacher' ? 'Teacher' : (role === 'parent' ? 'Parent' : 'Grade 7-A'));

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 bg-slate-900 border-b border-indigo-900/60 text-white px-3 sm:px-6 flex items-center justify-between shadow-md select-none">
      {/* Brand & School Identification (Left Side) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMobileMenuClick && (
          <button
            type="button"
            onClick={onMobileMenuClick}
            className="lg:hidden p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
          <School className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2 truncate">
          <span className="font-extrabold tracking-tight text-white text-xs sm:text-sm truncate">
            Greenwood Public School
          </span>
          <span className="text-slate-500 font-bold hidden sm:inline">|</span>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
            DEMO EDITION
          </span>
          <span className="text-slate-500 font-bold hidden md:inline">|</span>
          <span className="text-slate-300 text-[11px] font-semibold hidden md:inline truncate">
            Sector-9, Gurugram
          </span>
          <span className="text-slate-500 font-bold hidden lg:inline">|</span>
          <span className="text-slate-400 text-[11px] font-medium hidden lg:inline">
            CBSE 530649
          </span>
        </div>
      </div>

      {/* Authenticated Identity & Profile Action (Right Side - No role switcher buttons) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/80">
          <div className="w-5 h-5 rounded-full bg-indigo-600/60 text-white flex items-center justify-center text-[10px] font-bold">
            <User className="w-3 h-3 text-indigo-200" />
          </div>
          <span className="text-xs font-bold text-slate-200 hidden sm:inline truncate max-w-[130px]">
            {displayName}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
            {roleLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-900/60 hover:border-rose-600 border border-slate-700 transition-all"
          title="Sign out / Switch account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};
