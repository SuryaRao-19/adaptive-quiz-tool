import React, { useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { 
  Menu, 
  Sparkles, 
  MessageSquareText, 
  X, 
  Send, 
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { askAITutor } from '../../services/aiTutorService';

export const AppShell = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Floating AI Tutor Quick Drawer
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const studentName = user?.name ? user.name.split(' ')[0] : (user?.fullName ? user.fullName.split(' ')[0] : 'there');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: `Hi ${studentName}! I'm your AdaptIQ AI Tutor. Need help breaking down a Math or Science problem step-by-step?`
    }
  ]);

  // Is this a test page? If on /test, AI Tutor must be disabled to prevent cheating
  const isTestMode = location.pathname.startsWith('/test');

  const handleSendQuickMessage = async (e) => {
    e.preventDefault();
    if (!quickMessage.trim()) return;

    const userText = quickMessage;
    const updatedMessages = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(updatedMessages);
    setQuickMessage('');

    try {
      const response = await askAITutor({
        message: userText,
        chatHistory: updatedMessages,
        context: {
          topic: "General STEM",
          problem: ""
        }
      });

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.text
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Great question about "${userText.slice(0, 30)}..."! Let's break it down step-by-step: First check the common denominator or underlying principles. You can also view step-by-step worked solutions in the Solutions Hub!`
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-subtle">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--theme-primary,#4F46E5)] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              ✦
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">AdaptIQ</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            {user?.role || 'student'}
          </Badge>
        </div>
      </header>

      {/* Persistent Left Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <main className="flex-1 lg:pl-64 transition-all duration-300">
        <div className="min-h-full">
          <ErrorBoundary>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </ErrorBoundary>
        </div>
      </main>

      {/* FLOATING AI TUTOR LAUNCHER (Disabled on Test Mode) */}
      {!isTestMode ? (
        <div className="fixed bottom-6 right-6 z-40 no-print">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsTutorDrawerOpen(!isTutorDrawerOpen)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-glow-primary hover:shadow-elevated transition-all group"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>Ask AI Tutor</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </motion.button>

          {/* Quick Floating Chat Popover */}
          <AnimatePresence>
            {isTutorDrawerOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-elevated overflow-hidden flex flex-col h-[460px]"
              >
                {/* Popover Header */}
                <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                      ✦
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">AdaptIQ AI Tutor</h4>
                      <span className="text-[10px] text-cyan-300 font-medium">Context Aware Assistant</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/tutor"
                      onClick={() => setIsTutorDrawerOpen(false)}
                      className="text-[11px] text-indigo-200 hover:text-white underline font-semibold"
                    >
                      Full Page →
                    </Link>
                    <button
                      onClick={() => setIsTutorDrawerOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chat Message Scroll */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/60 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-subtle'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-subtle'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Prompt Chips */}
                <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
                  {["Explain this problem", "Give an analogy", "Formula help"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setQuickMessage(chip)}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-semibold border border-slate-200/60 dark:border-slate-700"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendQuickMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                  <Button type="submit" size="sm" variant="primary" className="px-3">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Test Mode: Anti-Cheating Inactive Badge Note */
        <div className="fixed bottom-6 right-6 z-40 no-print">
          <div className="px-3.5 py-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-md">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Tutor Disabled in Test Mode</span>
          </div>
        </div>
      )}
    </div>
  );
};
