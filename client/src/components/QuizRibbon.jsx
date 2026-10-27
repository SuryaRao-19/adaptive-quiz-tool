import React from 'react';
import { Wifi, WifiOff, RefreshCw, Clock, Flame, ShieldAlert } from 'lucide-react';

/**
 * Compact, non-blocking quiz status ribbon.
 * Sits at the top of assessment view without covering questions or inputs.
 */
export const QuizRibbon = ({
  currentIndex = 1,
  totalQuestions = 10,
  isOnline = true,
  pendingSyncCount = 0,
  streakCount = 0,
  timeSpent = 0,
  difficulty = 'medium',
  isTestMode = false,
  className = ''
}) => {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercentage = Math.round((currentIndex / totalQuestions) * 100);

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    medium: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    hard: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    very_hard: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800'
  };

  return (
    <div 
      role="region" 
      aria-label="Assessment Status Ribbon"
      className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-subtle mb-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Question counter and batch progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <span className="text-base sm:text-lg text-[var(--theme-primary,#4F46E5)]">{currentIndex}</span>
            <span className="text-slate-400 font-normal">/</span>
            <span className="text-slate-600 dark:text-slate-300">{totalQuestions}</span>
          </div>

          <div className="w-24 sm:w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div 
              className="h-full bg-[var(--theme-primary,#4F46E5)] rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>

          {difficulty && !isTestMode && (
            <span className={`uppercase font-bold tracking-wider text-[10px] sm:text-xs px-2 py-0.5 rounded-md border ${difficultyColors[difficulty] || difficultyColors.medium}`}>
              {difficulty.replace('_', ' ')}
            </span>
          )}

          {isTestMode && (
            <span className="inline-flex items-center gap-1 font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800">
              <ShieldAlert className="w-3 h-3" />
              Summative Exam
            </span>
          )}
        </div>

        {/* Right: Timer, Streaks, Offline Sync Status */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-slate-500 dark:text-slate-400 font-medium">
          {streakCount > 1 && !isTestMode && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span>{streakCount}x Streak</span>
            </div>
          )}

          {timeSpent > 0 && (
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          )}

          {/* Connection & Offline Sync indicator */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
            {isOnline ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            )}

            {pendingSyncCount > 0 && (
              <span 
                className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 animate-pulse"
                title={`${pendingSyncCount} answers stored locally awaiting server sync`}
              >
                <RefreshCw className="w-2.5 h-2.5" />
                {pendingSyncCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
