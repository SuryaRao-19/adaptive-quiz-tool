import React, { createContext, useState, useEffect } from 'react';
import { 
  MOCK_STUDENT, 
  MOCK_TEACHER, 
  MOCK_ADMIN, 
  MOCK_PARENT,
  MOCK_STUDENT_G3,
  MOCK_STUDENT_G7,
  MOCK_STUDENT_G10,
  DEMO_STUDENTS 
} from '../services/mockData';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledClasses, setEnrolledClasses] = useState(["GPS7AM", "GPS7AS", "GPS7BE"]);
  const [selectedGrade, setSelectedGrade] = useState(7);

  useEffect(() => {
    // Check URL parameter for demo persona auto-login (useful for presentations & live review)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const demoParam = urlParams.get('demo');
      if (demoParam === 'admin') {
        login('demo_token_admin', MOCK_ADMIN);
        setLoading(false);
        return;
      } else if (demoParam === 'teacher') {
        login('demo_token_teacher', MOCK_TEACHER);
        setLoading(false);
        return;
      } else if (demoParam === 'student-g3' || demoParam === 'alex') {
        login('demo_token_student_g3', MOCK_STUDENT_G3);
        setLoading(false);
        return;
      } else if (demoParam === 'student' || demoParam === 'aarav') {
        login('demo_token_student_g7', MOCK_STUDENT_G7);
        setLoading(false);
        return;
      } else if (demoParam === 'student-g10' || demoParam === 'diya') {
        login('demo_token_student_g10', MOCK_STUDENT_G10);
        setLoading(false);
        return;
      } else if (demoParam === 'parent') {
        login('demo_token_parent', MOCK_PARENT);
        setLoading(false);
        return;
      }
    } catch (e) { }

    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        const g = parsed.gradeLevel || parsed.grade || 7;
        setSelectedGrade(g);
        if (parsed.joinedClasses) setEnrolledClasses(parsed.joinedClasses);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        login('demo_token_student', MOCK_STUDENT_G7);
      }
    } else {
      // Default initial persona for demonstration: Middle School Student Aarav Patel (Grade 7)
      login('demo_token_student', MOCK_STUDENT_G7);
    }

    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    const g = newUser?.gradeLevel || newUser?.grade || 7;
    setSelectedGrade(g);
    localStorage.setItem('selectedGrade', String(g));
    if (newUser?.joinedClasses) {
      setEnrolledClasses(newUser.joinedClasses);
      localStorage.setItem('enrolledClasses', JSON.stringify(newUser.joinedClasses));
    }
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

  // Instant Persona Switcher for Greenwood Public School Demonstration
  const switchRole = (newRole, studentKey = null) => {
    let target = MOCK_STUDENT_G7;
    if (newRole === 'admin') target = MOCK_ADMIN;
    else if (newRole === 'teacher') target = MOCK_TEACHER;
    else if (newRole === 'parent') target = MOCK_PARENT;
    else if (newRole === 'student') {
      if (studentKey && DEMO_STUDENTS[studentKey]) {
        target = DEMO_STUDENTS[studentKey];
      } else {
        // default student: Aarav Patel (Grade 7)
        target = MOCK_STUDENT_G7;
      }
    }
    login(`demo_token_${newRole}_${target.id}`, target);
  };

  // Switch student profile by grade context
  const switchStudentByGrade = (targetGrade) => {
    const g = parseInt(targetGrade, 10);
    if (g === 3) switchRole('student', 'g3');
    else if (g === 10) switchRole('student', 'g10');
    else switchRole('student', 'g7');
  };

  const changeGrade = (newGrade) => {
    switchStudentByGrade(newGrade);
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
        selectedGrade: user?.gradeLevel || user?.grade || selectedGrade || 7,
        studentGrade: user?.gradeLevel || user?.grade || 7,
        changeGrade,
        switchStudentByGrade,
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
