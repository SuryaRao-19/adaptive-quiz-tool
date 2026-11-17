import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const THEMES = {
  // Institutional Greenwood Theme (Primary)
  'greenwood': {
    id: 'greenwood',
    name: 'Greenwood Forest & Gold (Official)',
    category: 'Institutional',
    roleTag: 'all',
    accentColor: '#173E2B',
    goldColor: '#D9A441',
    bgClass: 'theme-greenwood',
    description: 'Official Greenwood Public School institutional identity: Deep Forest Green (#173E2B) and Warm Gold (#D9A441).'
  },
  // Student Themes
  'student-indigo': {
    id: 'student-indigo',
    name: 'Student Forest Focus (Streaks)',
    category: 'Student',
    roleTag: 'student',
    accentColor: '#173E2B',
    bgClass: 'theme-student-indigo',
    description: 'Crisp forest green and gold with energetic streak multipliers and gamified feedback.'
  },
  'student-neon': {
    id: 'student-neon',
    name: 'Student Cyber Arcade (Green & Gold)',
    category: 'Student',
    roleTag: 'student',
    accentColor: '#10B981',
    bgClass: 'theme-student-neon',
    description: 'High-energy emerald and warm gold accents for active practice engagement.'
  },
  // Teacher Themes
  'teacher-navy': {
    id: 'teacher-navy',
    name: 'Teacher Academic Forest (Institutional)',
    category: 'Teacher',
    roleTag: 'teacher',
    accentColor: '#173E2B',
    bgClass: 'theme-teacher-navy',
    description: 'Deep authoritative Greenwood forest green with high-contrast cohort gradebook styling.'
  },
  'teacher-emerald': {
    id: 'teacher-emerald',
    name: 'Teacher Emerald Analytics (Gradebook)',
    category: 'Teacher',
    roleTag: 'teacher',
    accentColor: '#059669',
    bgClass: 'theme-teacher-emerald',
    description: 'Balanced forest emerald with clear diagnostic indicators and clean data tables.'
  },
  // Universal Themes
  'midnight': {
    id: 'midnight',
    name: 'Cyber Midnight (Dark Mode)',
    category: 'Universal',
    roleTag: 'all',
    accentColor: '#38BDF8',
    bgClass: 'theme-midnight dark',
    description: 'True deep slate dark mode for evening study and high-contrast projection.'
  },
  'sunset': {
    id: 'sunset',
    name: 'Sunset Warmth (Calm Solar)',
    category: 'Universal',
    roleTag: 'all',
    accentColor: '#EA580C',
    bgClass: 'theme-sunset',
    description: 'Soothing amber and terracotta accents for a friendly, calm classroom feel.'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('greenwood_theme') || 'greenwood';
  });

  useEffect(() => {
    localStorage.setItem('greenwood_theme', currentTheme);
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove(
      'theme-greenwood',
      'theme-student-indigo', 
      'theme-student-neon', 
      'theme-teacher-navy', 
      'theme-teacher-emerald', 
      'theme-midnight', 
      'theme-sunset', 
      'dark'
    );
    
    // Apply current theme
    if (currentTheme === 'midnight') {
      root.classList.add('dark', 'theme-midnight');
    } else {
      root.classList.add(THEMES[currentTheme]?.bgClass || `theme-${currentTheme}`);
    }
  }, [currentTheme]);

  const setTheme = (themeId) => {
    if (THEMES[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  // Helper to switch to role default theme
  const applyRoleDefaultTheme = (role) => {
    setTheme('greenwood');
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, applyRoleDefaultTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
