import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { School, LogOut, User, Menu, Bell, Calendar, MapPin, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcherBar = ({ onMobileMenuClick }) => {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedCampus, setSelectedCampus] = useState('sector-9');
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || (role === 'teacher' ? 'Mrs. Ananya Sharma' : (role === 'admin' ? 'Dr. K. S. Raman' : (role === 'parent' ? 'Mr. Vikram Patel' : 'Aarav Patel')));
  const roleLabel = role === 'admin' ? 'Principal' : (role === 'teacher' ? 'Teacher' : (role === 'parent' ? 'Parent' : 'Grade 7-A'));

  const campuses = [
    { id: 'sector-9', name: 'Main Campus: Sector-9 (Middle & Senior)', badge: 'Classes 1–12' },
    { id: 'sector-10a', name: 'Junior Wing: Sector-10A (Housing Board)', badge: 'Pre-Primary – V' }
  ];

  const currentCampus = campuses.find(c => c.id === selectedCampus) || campuses[0];

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 bg-[#173E2B] border-b border-[#D9A441]/40 text-white px-3 sm:px-6 flex items-center justify-between shadow-md select-none font-sans">
      {/* Brand & School Identification (Left Side) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMobileMenuClick && (
          <button
            type="button"
            onClick={onMobileMenuClick}
            className="lg:hidden p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-[#123021] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="w-7 h-7 rounded-lg bg-[#D9A441] text-[#173E2B] flex items-center justify-center shrink-0 shadow-sm font-bold">
          <School className="w-4 h-4 text-[#173E2B]" />
        </div>
        <div className="flex items-center gap-2 truncate">
          <span className="font-extrabold tracking-tight text-white text-xs sm:text-sm truncate">
            Greenwood Public School
          </span>
          <span className="text-[#D9A441]/60 font-bold hidden sm:inline">|</span>
          <span className="bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/40 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
            Digital Learning Platform
          </span>
          <span className="text-[#D9A441]/60 font-bold hidden lg:inline">|</span>
          <span className="text-emerald-100/80 text-[11px] font-medium hidden lg:inline">
            CBSE 530649
          </span>
        </div>
      </div>

      {/* Right Controls: Academic Year, Campus Selector, Notifications, Profile, Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Active Academic Year */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-100/90 font-medium bg-[#123021] px-2.5 py-1 rounded-lg border border-[#416B50]">
          <Calendar className="w-3.5 h-3.5 text-[#D9A441]" />
          <span>2026–2027</span>
        </div>

        {/* Database-Driven Campus Selector */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#123021] hover:bg-[#0E2419] text-white px-2.5 py-1 rounded-lg border border-[#416B50] transition-colors"
          >
            <MapPin className="w-3 h-3 text-[#D9A441]" />
            <span className="truncate max-w-[140px]">{selectedCampus === 'sector-9' ? 'Sector-9 Main' : 'Sector-10A Junior'}</span>
            <ChevronDown className="w-3 h-3 text-emerald-200" />
          </button>

          {campusDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 text-slate-800 dark:text-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                Select Operating Campus
              </span>
              {campuses.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCampus(c.id); setCampusDropdownOpen(false); }}
                  className={`w-full text-left p-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedCampus === c.id 
                      ? 'bg-emerald-50 text-[#173E2B] font-bold' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {c.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon linking to Announcements */}
        <button
          type="button"
          onClick={() => navigate('/announcements')}
          className="relative p-1.5 text-emerald-100 hover:text-white rounded-lg hover:bg-[#123021] transition-colors"
          title="Announcements & Circulars"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D9A441]" />
        </button>

        {/* Authenticated User Identity */}
        <div className="flex items-center gap-2 bg-[#123021] px-2.5 py-1 rounded-xl border border-[#416B50]">
          <div className="w-5 h-5 rounded-full bg-[#D9A441] text-[#173E2B] flex items-center justify-center text-[10px] font-black">
            {displayName[0]}
          </div>
          <span className="text-xs font-bold text-emerald-50 hidden sm:inline truncate max-w-[130px]">
            {displayName}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/40 uppercase tracking-wider">
            {roleLabel}
          </span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-100 hover:text-white bg-[#123021] hover:bg-rose-900/60 hover:border-rose-600 border border-[#416B50] transition-all"
          title="Sign out / Switch account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};
