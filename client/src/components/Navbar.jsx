import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';
import { 
  Sparkles, 
  ArrowRight, 
  Menu, 
  X,
  Palette,
  LayoutDashboard,
  GraduationCap,
  School
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const Navbar = () => {
  const { user, login, switchRole } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1-Click Demo Persona Switcher
  const handleQuickDemo = (role) => {
    switchRole(role);
    navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Sleek Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 flex items-center justify-center text-white shadow-glow-primary group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  AdaptIQ
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  SDG 4
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Focused Public Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a 
              href="#how-it-works" 
              className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#simulator" 
              className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              Live Simulator
            </a>
            <Link 
              to="/select" 
              className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              Subjects
            </Link>
            <Link 
              to="/styleguide" 
              className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design System</span>
            </Link>
          </nav>

          {/* 3. Actions: Theme Selector + Demo Switcher + Launch App */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Visual Theme Selector */}
            <ThemeSelector />

            {/* Quick 1-Click Demo Persona Pills */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => handleQuickDemo('student')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  user?.role !== 'teacher'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Student</span>
              </button>
              <button
                onClick={() => handleQuickDemo('teacher')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  user?.role === 'teacher'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <School className="w-3 h-3" />
                <span>Teacher</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <Link to="/dashboard">
              <Button size="sm" variant="primary" iconRight={ArrowRight}>
                Enter Workspace
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              How It Works
            </a>
            <a 
              href="#simulator" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Live Simulator
            </a>
            <Link 
              to="/select" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Subjects
            </Link>
            <Link 
              to="/styleguide" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>Design System</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Link to="/dashboard" className="w-full">
              <Button size="sm" variant="primary" fullWidth iconRight={ArrowRight}>
                Enter Workspace
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
