import React, { createContext, useState, useEffect } from 'react';
import { MOCK_STUDENT, MOCK_TEACHER } from '../services/mockData';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledClasses, setEnrolledClasses] = useState(["MATH-7B", "SCI-7A"]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedClasses = localStorage.getItem('enrolledClasses');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    if (savedClasses) {
      try {
        setEnrolledClasses(JSON.parse(savedClasses));
      } catch (e) {}
    }

    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    sessionStorage.removeItem('logged_out');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('logged_out', 'true');
  };

  const signup = (userData) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      ...userData
    };
    login(`token_${Date.now()}`, newUser);
    return newUser;
  };

  // Instant Persona Switcher for Live Demo & Reviewers
  const switchRole = (newRole) => {
    const target = newRole === 'teacher' ? MOCK_TEACHER : MOCK_STUDENT;
    login(`demo_token_${newRole}`, target);
  };

  const joinClass = (classCode) => {
    const updated = [...new Set([...enrolledClasses, classCode.toUpperCase()])];
    setEnrolledClasses(updated);
    localStorage.setItem('enrolledClasses', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'student',
        loading,
        enrolledClasses,
        login,
        logout,
        signup,
        switchRole,
        joinClass
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
