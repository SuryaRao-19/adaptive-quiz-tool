import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { DemoSwitcherBar } from '../DemoSwitcherBar';

export const AppShell = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // When actively taking an examination or quiz, provide an exclusive full-viewport experience without sidebar or global top bars
  const isExamSession = (location.pathname === '/test' && location.search.includes('id=')) || location.pathname === '/pre-test';

  if (isExamSession) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans antialiased text-slate-100 w-full overflow-x-hidden">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-100 flex flex-col">
      {/* 1. Global Top Bar (Full width across top, h-12, z-50) */}
      <DemoSwitcherBar onMobileMenuClick={() => setIsMobileOpen(true)} />

      {/* 2. Main Application Body (pt-12 ensures content starts cleanly below top bar) */}
      <div className="flex-1 flex pt-12 relative min-h-[calc(100vh-3rem)]">
        {/* Sidebar Navigation (Fixed left below top bar, top-12, w-64, z-40) */}
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        {/* Main Content Area (lg:pl-64 ensures desktop content never overlaps sidebar) */}
        <main className="flex-1 min-w-0 lg:pl-64 flex flex-col">
          <div className="flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10 max-w-7xl w-full mx-auto">
            <ErrorBoundary>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="h-full"
              >
                {children}
              </motion.div>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
