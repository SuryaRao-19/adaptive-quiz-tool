import React, { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { 
  Palette, 
  Check, 
  Sparkles, 
  Moon, 
  Flame, 
  GraduationCap, 
  School,
  Zap,
  BarChart3
} from 'lucide-react';

export const ThemeSelector = ({ size = 'md', align = 'right', direction = 'down', iconOnly = false }) => {
  const { currentTheme, setTheme, themes } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = (themeId) => {
    switch (themeId) {
      case 'student-indigo':
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />;
      case 'student-neon':
        return <Zap className="w-3.5 h-3.5 text-purple-500" />;
      case 'teacher-navy':
        return <School className="w-3.5 h-3.5 text-blue-600" />;
      case 'teacher-emerald':
        return <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'midnight':
        return <Moon className="w-3.5 h-3.5 text-sky-400" />;
      case 'sunset':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  const categories = ['Student', 'Teacher', 'Universal'];
  const positionClasses = direction === 'up' 
    ? `bottom-full mb-2 ${align === 'right' ? 'right-0' : 'left-0'}`
    : `top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'}`;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          iconOnly
            ? "p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            : "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-subtle transition-all active:scale-95"
        }
        title="Customize App Theme"
      >
        <Palette className={iconOnly ? "w-4 h-4 text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400" : "w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400"} />
        {!iconOnly && (
          <span className="hidden sm:inline capitalize">
            {themes[currentTheme]?.name.split(' ')[0]}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${positionClasses} w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-2 z-50 animate-levelUp text-xs max-h-96 overflow-y-auto`}
        >
          <div className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
            <span>Visual Theme Engine</span>
            <span className="text-[9px] font-mono text-indigo-500">6 Themes</span>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {cat} Themes
                </div>
                {Object.values(themes)
                  .filter((t) => t.category === cat)
                  .map((t) => {
                    const isSelected = currentTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-semibold transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-cyan-400 font-bold border border-indigo-100 dark:border-slate-700'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            {getThemeIcon(t.id)}
                          </div>
                          <div>
                            <span className="block leading-tight text-xs">{t.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal line-clamp-1">
                              {t.description}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
