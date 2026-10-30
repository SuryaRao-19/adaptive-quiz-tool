import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { ThemeSelector } from '../ThemeSelector';
import { 
  Sparkles, 
  Home, 
  BrainCircuit, 
  Clock, 
  BookOpen, 
  MessageSquareText, 
  Users, 
  Award, 
  FileText, 
  LogOut, 
  Settings, 
  X,
  GraduationCap,
  HelpCircle,
  Layers
} from 'lucide-react';
import { ContactSupportModal } from '../ContactSupportModal';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, role, logout, switchRole } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const profilePopoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profilePopoverRef.current && !profilePopoverRef.current.contains(e.target)) {
        setProfilePopoverOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setProfilePopoverOpen(false);
    };

    if (profilePopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profilePopoverOpen]);

  const navItems = [
    { label: "Overview", to: "/dashboard", icon: Home },
    { label: "Practice Mode", to: "/practice", icon: BrainCircuit, badge: "Adaptive" },
    { label: "Test Mode", to: "/test", icon: Clock, badge: "Timed" },
    { label: "Step-by-Step Solutions", to: "/solutions", icon: BookOpen },
    { label: "Reference Library", to: "/library", icon: FileText },
    { label: "AI Tutor Chat", to: "/tutor", icon: MessageSquareText, highlight: true },
    { 
      label: role === 'teacher' ? "Classroom Hub" : "My Classes", 
      to: "/classes", 
      icon: Users 
    },
    { 
      label: "Question Bank", 
      to: "/question-bank", 
      icon: Layers, 
      badge: "AI Gen" 
    },
    { label: "Progress & Analytics", to: "/metrics", icon: Award },
    { label: "Settings", to: "/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 w-64 flex flex-col justify-between transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Brand */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-primary,#4F46E5)] text-white flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">AdaptIQ</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                  SDG 4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5">Adaptive Learning Engine</p>
            </div>
          </NavLink>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname + location.search === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive: navActive }) => {
                  const active = navActive || isActive;
                  return `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-[var(--theme-primary-light,#EEF2FF)] text-[var(--theme-primary,#4F46E5)] font-bold shadow-subtle border border-[var(--theme-primary-border,#C7D2FE)] dark:bg-slate-800 dark:text-cyan-400 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`;
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--theme-primary,#4F46E5)] dark:text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                )}
              </NavLink>
            );
          })}

          {/* Help & Feedback (Web3Forms) */}
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(false);
              setSupportModalOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Feedback</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-mono">
              Support
            </span>
          </button>
        </div>

        {/* Pinned User Profile Block at Bottom */}
        <div className="p-3 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 relative" ref={profilePopoverRef}>
          {/* Quick Demo Persona Switcher Pill */}
          <div className="mb-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold">
            <button
              type="button"
              onClick={() => switchRole('student')}
              className={`flex-1 py-1 rounded-lg text-center transition-all ${
                role === 'student' ? 'bg-[var(--theme-primary,#4F46E5)] text-white shadow-subtle' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => switchRole('teacher')}
              className={`flex-1 py-1 rounded-lg text-center transition-all ${
                role === 'teacher' ? 'bg-[var(--theme-primary,#4F46E5)] text-white shadow-subtle' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Teacher
            </button>
          </div>

          {/* Interactive Profile Popup Box (Appears when clicking profile picture/user block) */}
          <AnimatePresence>
            {profilePopoverOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200 dark:border-slate-800 p-4 z-50 text-slate-800 dark:text-slate-100 space-y-3.5"
              >
                {/* Popover Header Banner */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 text-white flex items-center justify-center font-extrabold text-base flex-shrink-0 shadow-glow-primary">
                    {user?.avatar || (user?.fullName ? user.fullName[0].toUpperCase() : 'U')}
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {user?.fullName || user?.name || 'Demo User'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || (role === 'teacher' ? 'teacher@adaptiq.edu' : 'student@adaptiq.edu')}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                        {role === 'teacher' ? 'Educator' : `Grade ${user?.grade || user?.gradeLevel || 7} Student`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Details / Badges */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 text-xs space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Account Type:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{role}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Learning Track:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mathematics & Science</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Curriculum:</span>
                    <span className="font-bold text-indigo-600 dark:text-cyan-400 font-mono">UN SDG 4</span>
                  </div>
                </div>

                {/* Popover Action Links */}
                <div className="space-y-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePopoverOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfilePopoverOpen(false);
                      setSupportModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Help & Feedback</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono">Support</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfilePopoverOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact Profile Card Bar */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-subtle gap-2">
            {/* Interactive Profile Picture & Name Block */}
            <button
              type="button"
              onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
              aria-expanded={profilePopoverOpen}
              aria-haspopup="dialog"
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left group p-1 -m-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors focus:outline-none cursor-pointer"
              title="Click to view full user profile"
            >
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 group-hover:shadow-glow-primary transition-all">
                  {user?.avatar || (user?.fullName ? user.fullName[0].toUpperCase() : 'U')}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate leading-tight whitespace-nowrap group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                  {user?.fullName || user?.name || 'Demo User'}
                </p>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider truncate block leading-normal whitespace-nowrap">
                  {role} {role === 'student' ? `• G${user?.grade || user?.gradeLevel || 7}` : ''}
                </span>
              </div>
            </button>

            {/* Quick Icon Actions (Compact) */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <ThemeSelector size="sm" align="right" direction="up" iconOnly={true} />
              <button
                type="button"
                onClick={() => navigate('/settings')}
                title="Settings"
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Support & Feedback Web3Forms Modal */}
      <ContactSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </>
  );
};
